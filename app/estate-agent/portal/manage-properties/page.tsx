'use client';
import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import PortalMenu from "@/components/portal-menu";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth/user";
import { isEstateAgent, getAgentsLocationId } from "@/lib/auth/role"
import { doesPropertyBelongToAgent, fetchPropertiesByLocationID, fetchPropertiesByAgentID } from "@/lib/data/property-utils";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property-card";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type PropertyWithImages = Property & { images: string[] };

const PAGE_SIZE = 10;
const STATUSES = ["active", "under offer", "draft", "completed", "withdrawn", "deleted"];

export default function EstateAgentPropertiesPage() {
    const router = useRouter();
    const [locationId, setLocationId] = useState<string | null>(null);
    const [properties, setProperties] = useState<PropertyWithImages[]>([]);
    const [user, setUser] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [editableProperties, setEditableProperties] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<"all" | "mine">("all");
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const updateMedia = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

    useEffect(() => {
        async function checkEstateAgent() {
            try {
                const user = await validateUser();
                if (!user) {
                    router.push("/");
                    return;
                }
                setUser(user);
                const estateAgent = await isEstateAgent();
                if (!estateAgent) {
                    router.push("/");
                }
            } catch (error) {
                console.error("Error validating estate agent access:", error);
                router.push("/");
            }
        }

        checkEstateAgent();
    }, [router]);

    // load agency location
    useEffect(() => {
        if (!user) return; // wait until user has been set


        const loadAgencyLocation = async () => {
            try {
                setErrorMessage("")
                const locID = await getAgentsLocationId(user.user.id);
                if (locID?.estate_agency_location_id) {
                    setLocationId(locID.estate_agency_location_id);
                } else {
                    setErrorMessage("Unable to find estate agency location");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error loading agency location: ", error);
                setErrorMessage("Unable to load agency location");
                setLoading(false);
            }
        }
        loadAgencyLocation();

    }, [user]);

    /**
     * Fetch properties and property images for a given search results page
     * @param page Page number to fetch properties for - default is 1
     */
    const fetchProperties = useCallback(async (page: number = 1) => {
        if (!locationId || !user) return;

        try {
            setLoading(true);
            setErrorMessage("");
            // scroll to top
            window.scrollTo({ top: 0 });

            const result = viewMode === "mine"
                ? await fetchPropertiesByAgentID(user.user.id, page, PAGE_SIZE, selectedStatus || undefined)
                : await fetchPropertiesByLocationID(locationId, page, PAGE_SIZE, selectedStatus || undefined);

            if (!result) {
                setErrorMessage("Unable to fetch properties");
                return;
            }
            const { count, data } = result;
            
            setTotalProperties(count || 0);

            setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
            setCurrentPage(page);

            // fetch images simultaneously for all properties
            const entries = await Promise.all(
                (data ?? []).map(async (property) => {
                    const imageUrls = await getImagesFromStorage(property.id);
                    return { property, imageUrls };
                })
            )

            const propertiesList: PropertyWithImages[] = [];
            for (const { property, imageUrls } of entries) {
                if (!imageUrls) continue;
                propertiesList.push({ ...property, images: imageUrls });
            }
            setProperties(propertiesList);
        } catch (error) {
            console.error("Error fetching properties: ", error);
            setErrorMessage("Unable to fetch properties");
        } finally {
            setLoading(false);
        }
    }, [locationId, user, viewMode, selectedStatus]);

    useEffect(() => {
        fetchProperties(1);
    }, [fetchProperties]);

    // check which properties are editable by the agent
    useEffect(() => {
        async function checkEditableProperties() {
            if (!user || properties.length === 0) return;
            
            const editable = new Set<number>();
            for (const property of properties) {
                const isEditable = await doesPropertyBelongToAgent(property.id, user.user.id);
                if (isEditable) {
                    editable.add(property.id);
                }
            }
            setEditableProperties(editable);
        }
        
        checkEditableProperties();
    }, [user, properties]);


    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <PortalMenu role={"estate-agent"} />
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Manage Properties</CardTitle>
                            <CardDescription>
                                Here you can view all properties at your agency location, and edit or delete existing properties.
                                You are able to view all properties at your agency, and <b>edit only properties which you have added</b>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant={viewMode === "all" ? "default" : "outline"}
                                    onClick={() => { setViewMode("all"); setCurrentPage(1); }}
                                    className={viewMode === "all" ? "bg-buttonColor hover:bg-buttonHover text-foreground font-semibold" : ""}
                                >
                                    All Properties
                                </Button>
                                <Button
                                    variant={viewMode === "mine" ? "default" : "outline"}
                                    onClick={() => { setViewMode("mine"); setCurrentPage(1); }}
                                    className={viewMode === "mine" ? "bg-buttonColor hover:bg-buttonHover text-foreground font-semibold" : ""}
                                >
                                    My Properties
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Button
                                    variant={selectedStatus === null ? "default" : "outline"}
                                    onClick={() => { setSelectedStatus(null); setCurrentPage(1); }}
                                    className={selectedStatus === null ? "bg-buttonColor hover:bg-buttonHover text-foreground font-semibold" : ""}
                                >
                                    All Statuses
                                </Button>
                                {STATUSES.map((status) => (
                                    <Button
                                        key={status}
                                        variant={selectedStatus === status ? "default" : "outline"}
                                        onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                                        className={selectedStatus === status ? "bg-buttonColor hover:bg-buttonHover text-foreground font-semibold" : ""}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            {loading ? (
                                <p>Loading properties ...</p>
                            ) : (
                                <>
                                    <div className="pt-2 pb-4 px-4 text-highlight">
                                        <p>Showing properties {currentPage * PAGE_SIZE - (PAGE_SIZE - 1)} - {Math.min(currentPage * PAGE_SIZE, totalProperties)} of {totalProperties} properties</p>
                                    </div>
                                    <div className="w-full max-w-4xl">
                                        {properties.map((property) => (
                                            <PropertyCard key={property.id} property={property} images={property.images} page="manage" editable={editableProperties.has(property.id)} />
                                        ))}
                                    </div>
                                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                                    {properties.length > PAGE_SIZE &&
                                        <div className="flex flex-row gap-2 justify-center py-8 mb-6">
                                            {currentPage > 1 ? <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage - 1)}>
                                                <ChevronLeft size={16} />
                                                Previous
                                            </Button> : (
                                                <div className="mx-auto w-[100px]" />)} {/* placeholder to prevent layout shift when the Previous button is hidden */}

                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <div className="flex flex-row gap-1">
                                                    {/** On sm, or if there are too many pages, show only a subset of page numbers */}
                                                    {isMobile && totalPages > 3 && currentPage > 2 && (
                                                        <span className="text-lg text-muted-foreground">...</span>
                                                    )}
                                                    {!isMobile && totalPages > 8 && currentPage > 4 && (
                                                        <span className="text-lg text-muted-foreground">...</span>
                                                    )}
                                                    {Array.from({ length: isMobile ? 3 : totalPages > 8 ? 8 : totalPages }, (_, i) => {
                                                        if (isMobile) {
                                                            return currentPage > 1 ? (currentPage === totalPages ? currentPage - 2 + i : currentPage - 1 + i) : i + 1;
                                                        } else {
                                                            if (totalPages > 8) {
                                                                if (currentPage <= 4) {
                                                                    return i + 1;
                                                                } else if (currentPage >= totalPages - 3) {
                                                                    return totalPages - 7 + i;
                                                                } else {
                                                                    return currentPage - 3 + i;
                                                                }
                                                            }
                                                            return i + 1; // if total pages is 8 or less, show all page numbers
                                                        }
                                                    }).map((page) => (
                                                        <Button key={page} variant="outline" className={page === currentPage ? "bg-highlight text-white border-none hover:bg-highlight hover:text-white" : "hover:bg-midBlue"} size="sm" onClick={() => fetchProperties(page)}>
                                                            {page}
                                                        </Button>
                                                    ))}

                                                    {isMobile && totalPages > 3 && currentPage < totalPages - 1 && (
                                                        <span className="text-lg text-muted-foreground">...</span>
                                                    )}
                                                    {!isMobile && totalPages > 8 && currentPage < totalPages - 4 && (
                                                        <span className="text-lg text-muted-foreground">...</span>
                                                    )}
                                                </div>
                                                <p>Page {currentPage} of {totalPages}</p>
                                            </div>

                                            {currentPage < totalPages ? (
                                                <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage + 1)} hidden={currentPage === totalPages}>
                                                    Next
                                                    <ChevronRight size={16} />
                                                </Button>) :
                                                <div className="mx-auto w-[100px]" />
                                            }

                                        </div>
                                    }
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

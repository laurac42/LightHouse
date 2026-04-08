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
import { isSeller } from "@/lib/auth/role";
import { createClient } from "@/lib/supabase/client";
import { fetchPropertiesBySellerID } from "@/lib/data/property-utils";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property-card";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type PropertyWithImages = Property & { images: string[] };

const PAGE_SIZE = 10;
const STATUSES = ["active", "under offer", "draft", "completed", "withdrawn", "deleted"];

export default function SellerPropertiesPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<PropertyWithImages[]>([]);
    const [user, setUser] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const updateMedia = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

    useEffect(() => {
        async function checkSeller() {
            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getClaims();
                const user = data?.claims;
                setUser(user);
                const seller = await isSeller(user?.metadata?.sub);
                if (!seller) {
                    router.push("/");
                }
            } catch (error) {
                console.error("Error validating seller access:", error);
                router.push("/");
            }
        }

        checkSeller();
    }, [router]);


    /**
     * Fetch properties and property images for a given search results page
     * @param page Page number to fetch properties for - default is 1
     */
    const fetchProperties = useCallback(async (page: number = 1) => {
        if (!user) return;

        try {
            setLoading(true);
            setErrorMessage("");
            // scroll to top
            window.scrollTo({ top: 0 });

            const result = await fetchPropertiesBySellerID(user?.metadata?.sub, page, PAGE_SIZE, selectedStatus || undefined);

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
    }, [user, selectedStatus]);

    useEffect(() => {
        fetchProperties(1);
    }, [fetchProperties]);

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <PortalMenu role={"seller"} />
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Manage Properties</CardTitle>
                            <CardDescription>
                                Here you can manage the properties you have listed on Lighthouse. You can view all your properties, or just those with a specific status, using the filters below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                            <PropertyCard key={property.id} property={property} images={property.images} page="manage" editable={false} seller={true} />
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

"use client";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Database } from "@/types/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/property-card";
import { getImagesFromStorage } from "@/lib/data/images";
import { createClient } from "@/lib/supabase/client";
import { fetchFavourites } from "@/lib/data/favourites";
import { fetchPropertiesForPage } from "@/lib/data/property-utils";
import { fetchUserPreferences } from "@/lib/data/buyer-profile";
import { UserPreferences } from "@/types/user";


type Property = Database["public"]["Tables"]["properties"]["Row"] & { images: string[], isFavourite?: boolean };
const PAGE_SIZE = 10; // number of properties to display per page

export default function PropertiesPage() {

    const [properties, setProperties] = useState<Property[]>([]);
    const [location, setLocation] = useState("Dundee");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [userChecked, setUserChecked] = useState<Boolean>(false); // state to track whether we've checked if the user is logged in or not

    const updateMedia = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

    // determine whether the user is logged in or not
    useEffect(() => {
        const supabase = createClient();
        setUserChecked(false); // reset to false when the component mounts, so that we can check if the user is logged in or not and fetch personalised properties for logged in users if applicable
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUserId(session?.user?.id ?? null);
            setUserChecked(true); // so that we know we've checked if the user is logged in or not, and can fetch personalised properties for logged in users if applicable
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Fetch properties and property images for a given search results page
     * @param page Page number to fetch properties for - default is 1
     * @param id User ID for fetching personalised properties
     */
    const fetchProperties = useCallback(async (page: number = 1, id: string | null) => {
        try {
            // scroll to top
            setLoading(true);
            window.scrollTo({ top: 0 });

            let user_preferences = null;    
            if (id) {
                user_preferences = await fetchBuyerPreferences(id);
                if (user_preferences !== undefined) {
                    setPreferences(user_preferences);
                }
            }

            const { data, count } = await fetchPropertiesForPage(page, PAGE_SIZE, user_preferences);
            setTotalProperties(count || 0);

            setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
            setCurrentPage(page);

            if (!data || (Array.isArray(data) && data.length === 0)) {
                setProperties([]);
                setLoading(false);
                return;
            }
            const propertiesWithImages = await fetchPropertyImages(data as Property[]);

            if (!propertiesWithImages) {
                setProperties([]);
                setLoading(false);
                return;
            }
            const propertiesWithFavourites = await fetchFavouritesForProperties(propertiesWithImages) as Property[];

            setProperties(propertiesWithFavourites);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching properties: ", error);
        }
    }, []);

    useEffect(() => {
        if (!userChecked) return; // don't fetch properties until we've checked if the user is logged in or not, so that we can fetch personalised properties for logged in users
        fetchProperties(currentPage, userId); // fetch the first page of properties when the component mounts, and whenever the user logs in or out
    }, [fetchProperties, userChecked, userId]);

    // fetch buyer preferences for a given buyer
    async function fetchBuyerPreferences(id: string | null) {
        if (!id) {
            return null;
        }

        try { 
           const preferences = await fetchUserPreferences(id);
           return preferences;
        } catch (error) {
            console.error("Error fetching user preferences: ", error);
        }
    }

    // fetch images for a list of properties and add the image URLs to the corresponding property objects
    async function fetchPropertyImages(data: Property[]) {
        try {
        // fetch images simultaneously for all properties
            const entries = await Promise.all(
                (data ?? []).map(async (property) => {
                    const imageUrls = await getImagesFromStorage(property.id);
                    return { property, imageUrls };
                })
            )

            const propertiesList: Property[] = [];
            for (const { property, imageUrls } of entries) {
                if (!imageUrls) continue;
                propertiesList.push({ ...property, images: imageUrls });
            }
            return propertiesList;
        } catch (error) {
            console.error("Error fetching property images: ", error);
        }
    }

    // fetch the user's favourite properties and mark them as favourites in the properties list
    async function fetchFavouritesForProperties(propertiesList: Property[]) {
        try {
            const favouriteIds = userId
                ? await fetchFavourites(
                    propertiesList.map((property) => property.id),
                    userId,
                )
                : [];

            const favouriteIdsSet = new Set(favouriteIds);
            const propertiesWithFavourites = propertiesList.map((property) => ({
                ...property,
                isFavourite: favouriteIdsSet.has(property.id),
            }));
            return propertiesWithFavourites;
        } catch (error) {
            console.error("Error fetching favourites: ", error);
        }
    }

    return (
        <div className="bg-background min-h-screen w-full">
            <Navbar />
            <FilterBar />
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-2xl text-gray-500">Loading properties...</p>
                </div>
            ) : (
                <div className="pt-2 px-6 text-highlight">
                    <p>Showing properties {currentPage * PAGE_SIZE - (PAGE_SIZE - 1)} - {Math.min(currentPage * PAGE_SIZE, totalProperties)} of {totalProperties} properties in {location}</p>
                </div>
            )}
            <div className="flex w-full items-center justify-center pt-4 px-6 md:px-10 md:pt-10">
                <div className="w-full max-w-4xl">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} images={property.images} page="properties" />
                    ))}
                </div>

            </div>
            <div className="flex flex-row gap-2 justify-center py-8 mb-6">
                {currentPage > 1 ? <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage - 1, userId)}>
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
                            <Button key={page} variant="outline" className={page === currentPage ? "bg-highlight text-white border-none hover:bg-highlight hover:text-white" : "hover:bg-midBlue"} size="sm" onClick={() => fetchProperties(page, userId)}>
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
                    <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage + 1, userId)} hidden={currentPage === totalPages}>
                        Next
                        <ChevronRight size={16} />
                    </Button>) :
                    <div className="mx-auto w-[100px]" />
                }
            </div>
        </div>
    );
}

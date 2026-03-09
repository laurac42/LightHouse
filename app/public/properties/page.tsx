"use client";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/property-card";


type Property = Database["public"]["Tables"]["properties"]["Row"] & { images: string[] };

export default function PropertiesPage() {

    const [properties, setProperties] = useState<Property[]>([]);
    const [location, setLocation] = useState("Dundee");
    const PAGE_SIZE = 10; // number of properties to display per page
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const updateMedia = () => {
        setIsMobile(window.innerWidth < 768);
    };

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, []);

    /**
     * Fetch properties and property images for a given search results page
     * @param page Page number to fetch properties for - default is 1
     */
    async function fetchProperties(page: number = 1) {
        try {
            // scroll to top
            window.scrollTo({ top: 0 });

            const supabase = await createClient();
            const { data, error, count } = await supabase
                .from("properties")
                .select("*", { count: "exact" })
                .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

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

            const propertiesList: Property[] = [];
            for (const { property, imageUrls } of entries) {
                if (!imageUrls) continue;
                propertiesList.push({ ...property, images: imageUrls });
            }
            setProperties(propertiesList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching properties: ", error);
        }
    }

    /**
     * Get property image URLs from Supabase storage for a given property ID
     * @param id ID of the property to get images for
     * @returns a list of image URLs for the property, or an empty list if no images are found or an error occurs
     */
    async function getImagesFromStorage(id: number) {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase.storage.from("lighthouse-bucket").list(`properties/${id}`);
            if (error) {
                throw error;
            }
            return data?.map((item) => item.name) || [];
        } catch (error) {
            console.error("Error fetching property images: ", error);
            return [];
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
                        <PropertyCard key={property.id} property={property} images={property.images} />
                    ))}
                </div>

            </div>
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
        </div>
    );
}

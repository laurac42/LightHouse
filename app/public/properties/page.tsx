"use client";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";
import { Database } from "@/types/supabase";
import { count } from "console";
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

    useEffect(() => {
        fetchProperties();
    }, []);

    /**
     * Fetch properties and property images for a given search results page
     * @param page Page number to fetch properties for - default is 1
     */
    async function fetchProperties(page: number = 1) {
        try {
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
                {currentPage > 1 ? <Button className="mx-auto bg-buttonColor hover:bg-buttonHover" variant="outline" size="sm" onClick={() => fetchProperties(currentPage - 1)}>
                    <ChevronLeft size={16} />
                    Previous
                </Button> : (
                    <div className="mx-auto" />)} {/* placeholder to prevent layout shift when the Previous button is hidden */}

                <div className="flex flex-col justify-center items-center gap-2">
                    <div className="flex flex-row gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button key={page} variant="outline" className={page === currentPage ? "bg-highlight text-white border-none hover:bg-highlight hover:text-white" : "hover:bg-midBlue"} size="sm" onClick={() => fetchProperties(page)}>
                                {page}
                            </Button>
                        ))}
                    </div>
                    <p>Page {currentPage} of {totalPages}</p>
                </div>

                {currentPage < totalPages ? (
                    <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage + 1)} hidden={currentPage === totalPages}>
                        Next
                        <ChevronRight size={16} />
                    </Button>) :
                    <div className="mx-auto" />
                }
            </div>
        </div>
    );
}

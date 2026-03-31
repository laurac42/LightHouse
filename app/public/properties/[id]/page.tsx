'use client';
import { Suspense, useEffect, useState, CSSProperties } from "react";
import { use, useRef } from "react";
import { fetchPropertyDetails, getAgencyDetails } from "@/lib/data/property-utils";
import { fetchPropertyTags } from "@/lib/data/tag-utils";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import ImageCarousel from "@/components/image-carousel";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { AgencyLocationDetails } from "@/types/agency";
import AgencyCard from "@/components/agency-card";
import PropertyDetails from "@/components/property-details";
import { fetchFavourites } from "@/lib/data/favourites";
import { validateUser } from "@/lib/auth/user";
import { Button } from "@/components/ui/button";
import type { Tag, TagCount } from "@/types/tags";

type Property = Database["public"]["Tables"]["properties"]["Row"] & { isFavourite?: boolean, tags?: TagCount[] };

// Component to fetch and display property details, images and agency details for a given property ID
export function PropertyDetailsPage({ params }: { params: Promise<{ id: number }> }) {
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [agencyDetails, setAgencyDetails] = useState<AgencyLocationDetails | null>(null);
    const [barHeight, setBarHeight] = useState(0);
    const barRef = useRef(null);
    const [isFixed, setIsFixed] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Set the height of the bar for spacing when it becomes fixed and add scroll listener to toggle fixed position
    useEffect(() => {
        const onScroll = () => {
            setIsFixed(window.scrollY > 80);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const propertyData = await fetchPropertyDetails(id);
                setProperty(propertyData);
                if (propertyData) {
                    getImagesFromStorage(propertyData.id).then((imageUrls) => {
                        setImages(imageUrls);
                    });

                    fetchPropertyTags(propertyData.id).then((tags) => {
                        setProperty((prev) => prev ? { ...prev, tags } : prev);
                    });

                    const user = await validateUser();
                    if (user) {
                        fetchFavourites([propertyData.id], user?.user.id || "").then((favouriteIds) => {
                            if (favouriteIds.includes(propertyData.id)) {
                                setProperty((prev) => prev ? { ...prev, isFavourite: true } : prev);
                            }
                        });
                    } else {
                        setProperty((prev) => prev ? { ...prev, isFavourite: false } : prev);
                    }

                }
            } catch (error) {
                console.error("Error fetching property details:", error);
            }
        };
        fetchProperty();
    }, [id]);

    useEffect(() => {
        if (property?.agency_location_id) {
            getAgencyDetails(property.agency_location_id).then((details) => {
                setAgencyDetails(details);
            }
            );
        }
    }, [property?.agency_location_id]);

    return (
        <div>
            {/** Agency card scrolls until the navbar disappears, then is fixed */}
            <div ref={barRef} className={`col-span-1 border-none lg:top-0 lg:right-4 w-1/3 pl-8 lg:py-2 ${isFixed ? 'lg:fixed lg:top-[80px]' : 'lg:absolute lg:pt-28'}`} style={{ zIndex: 50, height: barHeight } as CSSProperties}>
                {!isImageModalOpen && agencyDetails && (
                    <AgencyCard agencyDetails={agencyDetails} />
                )}
            </div>
            {isFixed && <div style={{ height: barHeight }} />}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-12 py-2 border-none">
                <div className="col-span-2">
                    {property && images.length > 0 ? (
                        <div>
                            <ImageCarousel
                                images={images}
                                property={property}
                                page="property-details"
                                isModalOpen={setIsImageModalOpen}
                            />
                        </div>
                    ) : null}
                </div>
                {property && <PropertyDetails params={{ id, property }} page="view" />}
            </div>
        </div>
    );

}

// Separate component to allow use of suspense for loading state while fetching property details and agency details
export default function Page({ params }: { params: Promise<{ id: number }> }) {
    const router = useRouter();
    return (
        <Suspense fallback={<div>Loading...</div>}>

            <div className="bg-background min-h-screen w-full">
                <Navbar />
                <Button className="text-highlight text-md mt-4 ml-4" variant={"link"} onClick={() => router.back()}><MoveLeft /> &nbsp; Back to Properties</Button>
                <PropertyDetailsPage params={params} />
            </div>
        </Suspense>
    );
}
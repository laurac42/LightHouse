'use client';
import { Suspense, useEffect, useState, CSSProperties } from "react";
import { use, useRef } from "react";
import { fetchPropertyDetails, getAgencyDetails } from "@/lib/data/property-utils";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import ImageCarousel from "@/components/image-carousel";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { AgencyLocationDetails } from "@/types/agency";
import AgencyCard from "@/components/agency-card";
import PropertyDetails from "@/components/property-details";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSeller } from "@/lib/auth/role";

type Property = Database["public"]["Tables"]["properties"]["Row"];

// Component to fetch and display property details, images and agency details for a given property ID
function PropertyDetailsPage({ params }: { params: Promise<{ id: number }> }) {
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [agencyDetails, setAgencyDetails] = useState<AgencyLocationDetails | null>(null);
    const [barHeight, setBarHeight] = useState(0);
    const barRef = useRef(null);
    const [isFixed, setIsFixed] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const router = useRouter();

    // check user is authenticated to be on this page
    useEffect(() => {
        async function checkSeller() {
            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getClaims();
                const user = data?.claims;
                const seller = await isSeller(user?.user_metadata?.sub);
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
            const propertyData = await fetchPropertyDetails(id);
            setProperty(propertyData);
            if (propertyData) {
                getImagesFromStorage(propertyData.id).then((imageUrls) => {
                    setImages(imageUrls);
                });
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
            <div ref={barRef} className={`col-span-1 border-none lg:top-0 lg:right-4 w-1/3 pl-8 lg:py-2 ${isFixed ? 'lg:fixed lg:pt-8' : 'lg:absolute lg:pt-28'}`} style={{ zIndex: 50, height: barHeight } as CSSProperties}>
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
                {property && <PropertyDetails params={{ id, property }} page="edit" />}
            </div>
        </div>
    );

}

// Separate component to allow use of suspense for loading state while fetching property details and agency details
export default function Page({ params }: { params: Promise<{ id: number }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>

            <div className="bg-background min-h-screen w-full">
                <Navbar />
                <Link className="flex inline-flex text-highlight m-6 mb-0 mt-4" href="/estate-agent/portal/manage-properties"><MoveLeft /> &nbsp; Back to Agent Portal</Link>
                <PropertyDetailsPage params={params} />
            </div>
        </Suspense>
    );
}
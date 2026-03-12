'use client';
import { Suspense, useEffect, useState, CSSProperties } from "react";
import { use, useRef } from "react";
import { fetchPropertyDetails, getAgencyDetails } from "@/lib/data/property-utils";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import ImageCarousel from "@/components/image-carousel";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Landmark, Lightbulb, MoveLeft, Bath, Bed, Home, Grid2X2 } from "lucide-react";
import { AgencyLocationDetails } from "@/types/agency";
import AgencyCard from "@/components/agency-card";
import { sanitizeDescription } from "@/lib/data/property-utils";
import styles from '../page.module.css';

type Property = Database["public"]["Tables"]["properties"]["Row"];

/**
 * Descritpion has no classes, so features class is applied to the 'Key Features' heading in the description to allow styling of the features section
 * @param description The description to apply classes to
 * @param styles The CSS module styles object containing the features class
 * @returns The description with the features class applied to the 'Key Features' heading
 */
function applyClassesToDescription(description: string, styles: { [key: string]: string }) {
    // apply the features class to the 'Key Features' heading
    description = description.replace(/<h1>(Key [fF]eatures)<\/h1>/, `<h1 class="${styles.features}">Key Features</h1>`);
    return description;
}

// Component to fetch and display property details, images and agency details for a given property ID
function PropertyDetails({ params }: { params: Promise<{ id: number }> }) {
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
        const nav = document.getElementById("navbar");
        const bar = barRef.current;

        const onScroll = () => {
            if (bar && nav) {
                const navBottom = nav.getBoundingClientRect().bottom;
                setIsFixed(navBottom <= 0);
            };
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
            <div ref={barRef} className={`col-span-1 border-none lg:top-0 lg:right-4 w-1/3 pl-8 lg:py-2 ${isFixed ? 'lg:fixed lg:pt-8' : 'lg:absolute lg:pt-28'}`} style={{ zIndex: 1000, height: barHeight } as CSSProperties}>
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

                {property && (
                    <div className="px-2 lg:px-4 py-4 col-start-1 col-span-2">
                        <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                        <hr />
                        <div className="grid grid-cols-2 lg:grid-cols-3 md:px-8 px-1 py-1 lg:py-2 text-md gap-2 lg:gap-4">
                            <div className="inline-flex items-center gap-1 font-bold">
                                <Home size={16} />
                                {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : ""}
                            </div>
                            <div className="inline-flex items-center gap-1 font-bold">
                                <Bed size={16} />
                                {property.num_bedrooms} {property.num_bedrooms === 1 ? "bedroom" : "bedrooms"}

                            </div>
                            <div className="inline-flex items-center gap-1 font-bold">
                                <Bath size={16} />
                                {property.num_bathrooms} {property.num_bathrooms === 1 ? "bathroom" : "bathrooms"}
                            </div>
                            <div className="inline-flex items-center gap-1 font-bold">
                                <Grid2X2 size={16} />
                                {property.square_feet} sqft
                            </div>
                            <div className="inline-flex items-center gap-1 font-bold">
                                <Lightbulb size={16} />
                                EPC: {property.epc_rating ? property.epc_rating.toUpperCase() : "N/A"}
                            </div>
                            <div className="inline-flex items-center gap-1 font-bold">
                                <Landmark size={16} />
                                Council Tax: {property.council_tax_band ? property.council_tax_band.toUpperCase() : "N/A"}
                            </div>
                        </div>
                        <hr />
                        <div className={styles.description + ' mb-20 md:mb-28 lg:mb-8'} dangerouslySetInnerHTML={{ __html: sanitizeDescription(applyClassesToDescription(property.description, styles)) }} />
                    </div>
                )}
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
                <Link className="flex inline-flex text-highlight m-6 mb-0 mt-4" href="/properties"><MoveLeft /> &nbsp; Back to Properties</Link>
                <PropertyDetails params={params} />
            </div>
        </Suspense>
    );
}
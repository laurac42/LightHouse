'use client';
import { Suspense, useEffect, useState } from "react";
import { use } from "react";
import { fetchPropertyDetails, getAgencyDetails } from "@/lib/data/property";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import ImageCarousel from "@/components/image-carousel";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { MoveLeft, Phone, Mail } from "lucide-react";
import { AgencyLocationDetails } from "@/types/agency";
import AgencyCard from "@/components/agency-card";

type Property = Database["public"]["Tables"]["properties"]["Row"];

function PropertyDetails({ params }: { params: Promise<{ id: number }> }) {
    const { id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [agencyDetails, setAgencyDetails] = useState<AgencyLocationDetails | null>(null);

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
                console.log("Fetched agency details: ", details);
            }
            );
        }
    }, [property?.agency_location_id]);

    return (
        <div>
            <div className="col-span-1 border-none fixed right-4 w-1/3 pl-8 py-4">
                {agencyDetails && (
                    <AgencyCard agencyDetails={agencyDetails} />
                )}
            </div>
            <div className="grid grid-cols-3 gap-8 px-12 py-4 border-none">
                <div className="col-span-2">
                    {property && images.length > 0 ? (
                        <div>
                            <ImageCarousel images={images} property={property} page="property-details" />
                        </div>
                    ) : null}
                </div>
            </div>
            <h1>Property Details</h1>
            <p>Property ID: {id}</p>
            {property && (
                <div>
                    <p>Property Name: {property.title}</p>
                    <p>Property Description: {property.description}</p>
                </div>
            )}

        </div>
    );

}

export default function Page({ params }: { params: Promise<{ id: number }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="bg-background min-h-screen w-full">
                <Navbar />
                <Link className="flex inline-flex text-highlight m-6 mb-0 mt-6" href="/properties"><MoveLeft /> &nbsp; Back to Properties</Link>
                <PropertyDetails params={params} />
            </div>
        </Suspense>
    );
}
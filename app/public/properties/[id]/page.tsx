'use client';
import { Suspense, useEffect, useState } from "react";
import { use } from "react";
import { fetchPropertyDetails, getAgencyDetails } from "@/lib/data/property";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import ImageCarousel from "@/components/image-carousel";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { AgencyLocationDetails } from "@/types/agency";

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
            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                <div className="col-span-2">
                    {property && images.length > 0 ? (
                        <div>
                            <ImageCarousel images={images} property={property} page="property-details" />
                        </div>
                    ) : null}
                </div>
                <div className="col-span-1">
                    {agencyDetails && (
                        <div className="p-4 border rounded">
                            <h2 className="text-lg font-bold mb-2">{agencyDetails.name}</h2>
                            <p className="mb-1"><strong>Email:</strong> {agencyDetails.email}</p>
                            <p className="mb-1"><strong>Phone:</strong> {agencyDetails.phone_number}</p>
                            <p className="mb-1"><strong>Address:</strong> {agencyDetails.address_line_1}, {agencyDetails.address_line_2}, {agencyDetails.city}, {agencyDetails.post_code}</p>
                            {agencyDetails.logo_url && (
                                <img src={agencyDetails.logo_url} alt={`${agencyDetails.name} Logo`} className="mt-2 max-h-20" />
                            )}
                        </div>
                    )}
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
                <Link className="flex inline-flex text-highlight m-2" href="/properties"><MoveLeft /> &nbsp; Back to Properties</Link>
                <PropertyDetails params={params} />
            </div>
        </Suspense>
    );
}
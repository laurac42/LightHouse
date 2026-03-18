'use client';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";;
import { Database } from "@/types/supabase";
import { Home, Bed, Bath, Grid2X2, Lightbulb, Landmark, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { getAgencyDetails } from "@/lib/data/property-utils";
import Link from 'next/link';
import ImageCarousel from "./image-carousel";
import type { AgencyLocationDetails } from "@/types/agency";
import { uppercaseWords } from "@/lib/data/property-utils";
import { Button } from "./ui/button";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function PropertyCard({ property, images, page, editable = false }: { property: Property; images: string[]; page: string; editable?: boolean }) {
    const [agencyDetails, setAgencyDetails] = useState<AgencyLocationDetails | null>(null);

    useEffect(() => {
        if (property.agency_location_id) {
            getAgencyDetails(property.agency_location_id).then((details) => {
                setAgencyDetails(details);
            });
        }
    }, []);

    return (
        <Card key={property.id} className="bg-white/90 border-none mb-6">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className={page === "manage" ? "flex flex-col gap-0 md:w-64 shrink-0" : "flex flex-col gap-0 md:w-80 shrink-0"}>
                        <ImageCarousel images={images} property={property} page={page} isModalOpen={null} />
                        <div>
                            <CardHeader className="p-0 gap-0 m-0 bg-highlight rounded-b-md text-white flex flex-row items-center justify-center">
                                <CardTitle className="text-2xl text-center">{'£' + property.price.toLocaleString()}</CardTitle>
                                <p className="text-center text-sm"> &nbsp; {uppercaseWords(property.price_type || '')}</p>
                            </CardHeader>
                        </div>
                    </div>
                    <div className="flex-1 px-4">
                        {page === "properties" && (
                            <Link href={`properties/${property.id}`}>
                                <CardHeader className="p-1 pt-2">
                                    <CardTitle className="text-xl">{property.title}</CardTitle>
                                </CardHeader>
                            </Link>
                        )}
                        {page === "manage" && (
                            <div className="flex gap-2">
                                <CardHeader className="p-1 mt-2">
                                    <CardTitle className="text-xl">{property.title},  {property.post_code}</CardTitle>
                                </CardHeader>
                                {editable ? (
                                    <div className="flex flex-row gap-1">
                                        <Link href={`manage-properties/${property.id}/edit`}>
                                            <Button
                                                className="bg-buttonColor hover:bg-buttonColor/90 justify-end mt-2 p-1 text-foreground">Edit Property</Button>
                                        </Link>
                                        <Link href={`manage-properties/${property.id}/edit-status`}>
                                            <Button
                                                className="bg-buttonColor hover:bg-buttonColor/90 justify-end mt-2 p-1 text-foreground">Edit Status</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Link href={`manage-properties/${property.id}`}>
                                        <Button className="bg-midBlue hover:bg-midBlueHover justify-end mt-2 text-foreground">View Property</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                        <div>
                            {page === "properties" ? (
                                <Link href={`properties/${property.id}`}>
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
                                </Link>) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 md:px-8 px-1 py-1 lg:py-2 text-md gap-1 lg:gap-2">
                                    <div className="inline-flex items-center gap-1">
                                        <b>Type:</b> {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : ""}
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                        <b>Bedrooms:</b> {property.num_bedrooms}
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                        <b>Bathrooms:</b> {property.num_bathrooms}
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                        <b>Square Feet:</b> {property.square_feet}
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                        <b>EPC:</b> {property.epc_rating ? property.epc_rating.toUpperCase() : "N/A"}
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                        <b>Council Tax:</b> {property.council_tax_band ? property.council_tax_band.toUpperCase() : "N/A"}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={page === "properties" ? "text-sm text-muted-foreground max-h-[100px] mx-1 my-4 overflow-hidden text-ellipsis line-clamp-4 lg:line-clamp-5" : "text-sm text-muted-foreground max-h-[100px] mx-1 my-1 overflow-hidden text-ellipsis line-clamp-2 lg:line-clamp-3"}>
                            {property.description}
                        </div>
                        {agencyDetails && page !== "manage" && (
                            <div className="flex flex-row items-center gap-4 pb-2 md:py-0">
                                {agencyDetails.logo_url && (
                                    <img
                                        src={agencyDetails.logo_url}
                                        alt="Agency logo"
                                        className="w-20 object-contain"
                                    />
                                )}
                                <div className="flex flex-row ml-auto pr-4 gap-4">
                                    {agencyDetails.phone_number && (
                                        <div className="flex justify-end">
                                            <a className='mr-0 flex items-center gap-1 font-bold underline hover:text-blue-500' href={`tel:${agencyDetails.phone_number}`}>
                                                Call <Phone />
                                            </a>
                                        </div>
                                    )}
                                    {agencyDetails.email && (
                                        <a className='flex items-center gap-1 font-bold underline hover:text-blue-500' href={`mailto:${agencyDetails.email}`}>
                                            Email <Mail />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </CardContent>
        </Card>

    )
}
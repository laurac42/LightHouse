'use client';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import DOMPurify from "dompurify";
import { Database } from "@/types/supabase";
import { Home, Bed, Bath, Grid2X2, Lightbulb, Landmark, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';
import ImageCarousel from "./image-carousel";

type Property = Database["public"]["Tables"]["properties"]["Row"];

type AgencyDetails = {
    email: string;
    logo_url: string;
    phone_number: string;
}


export default function PropertyCard({ property, images }: { property: Property; images: string[] }) {
    const [agencyDetails, setAgencyDetails] = useState<AgencyDetails | null>(null);

    useEffect(() => {
        if (property.agency_location_id) {
            getAgencyDetails(property.agency_location_id).then((details) => {
                setAgencyDetails(details);
            });
        }
    }, []);


    /**
     * Sanitize property description to prevent XSS attacks, allowing only basic formatting tags
     * @param description Property description to sanitize
     * @returns Sanitized description safe for rendering as HTML
     */
    function sanitizeDescription(description: string | null) {
        if (!description) return "";
        return DOMPurify.sanitize(description, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'ul', 'li', 'p', 'br', 'h1'] });
    }

    /**
     * Remove bullet points and headings and p tags from property description for displaying on cards
     * @param description description to remove bullet points and headings from
     * @returns Description with bullet points and headings removed
     */
    function removeBulletsAndHeadings(description: string | null) {
        if (!description) return "";
        // remove p tags but not content inside them, remove h1 tags and content inside them, remove ul and li tags but not content inside them
        return description.replace(/<p> *?|<\/p> *?|<h1>[\s\S]*<\/h1>|<ul>[\s\S]*?<\/ul>|<li>[\s\S]*?<\/li>/g, '');
    }

    /**
     * Gets agency details (email, phone number, logo) for a given agency location ID
     * @param agencyId Id of the agency location to get details of
     * @returns Agency details or null if not found
     */
    async function getAgencyDetails(agencyId: string) {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase.rpc('getagencylocationdetails', { p_id: agencyId });
            
            if (error || !data) { throw error || new Error("No data returned from RPC"); }
            
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            console.error("Error fetching agency details: ", error);
            return null;
        }
    }

    /**
     * Make all words in a string uppercase
     * @param string to convert
     * @returns string with all words in uppercase
     */
    function uppercaseWords(str: string) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    return (
        <Card key={property.id} className="bg-white/90 border-none mb-6">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-col gap-0 md:w-80 shrink-0">
                        <ImageCarousel images={images} property={property} />
                        <div>
                            <CardHeader className="p-0 gap-0 m-0 bg-highlight rounded-b-md text-white flex flex-row items-center justify-center">
                                <CardTitle className="text-2xl text-center">{'£' + property.price.toLocaleString()}</CardTitle>
                                <p className="text-center text-sm"> &nbsp; {uppercaseWords(property.price_type || '')}</p>
                            </CardHeader>
                        </div>
                    </div>
                    <div className="flex-1 px-4">
                        <Link href={`properties/${property.id}`}>
                            <CardHeader className="p-1 pt-2">
                                <CardTitle className="text-xl">{property.title}</CardTitle>
                            </CardHeader>
                        </Link>
                        <div>
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
                            </Link>
                        </div>
                        <div className='text-sm text-muted-foreground max-h-[100px] mx-1 my-4 overflow-hidden text-ellipsis line-clamp-4 lg:line-clamp-5' dangerouslySetInnerHTML={{ __html: removeBulletsAndHeadings(sanitizeDescription(property.description)) }} />
                        {agencyDetails && (
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
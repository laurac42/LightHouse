'use client';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";;
import { Database } from "@/types/supabase";
import { Home, Bed, Bath, Grid2X2, Lightbulb, Landmark, Mail, Phone, Pencil, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getAgencyDetails } from "@/lib/data/property-utils";
import Link from 'next/link';
import ImageCarousel from "./image-carousel";
import type { AgencyLocationDetails } from "@/types/agency";
import { uppercaseWords } from "@/lib/data/property-utils";
import { Button } from "./ui/button";
import { removeFavourite, saveFavourite } from "@/lib/data/favourites";
import { validateUser } from "@/lib/auth/user";
import { toast } from "sonner";
import { fetchPropertyTags } from "@/lib/data/tag-utils";
import { TagCount } from "@/types/tags";

type Property = Database["public"]["Tables"]["properties"]["Row"] & { isFavourite?: boolean };

// pages are:
// properties - for listing properties on the main page
// manage - for managing properties in the dashboard
// favourites - for listing properties in the user's favourites page
export default function PropertyCard({ property, images, page, editable = false, seller = false }: { property: Property; images: string[]; page: string; editable?: boolean; seller?: boolean }) {
    const [agencyDetails, setAgencyDetails] = useState<AgencyLocationDetails | null>(null);
    const [isFavourite, setIsFavourite] = useState(property.isFavourite || false);
    const [propertyTags, setPropertyTags] = useState<TagCount[]>([]);

    useEffect(() => {
        if (property.agency_location_id) {
            getAgencyDetails(property.agency_location_id).then((details) => {
                setAgencyDetails(details);
            });
        }
    }, []);

    useEffect(() => {
        fetchPropertyTags(property.id, undefined).then((tags) => {
            setPropertyTags(tags.slice(0, 5)); // only display top 5 tags for each property
            for (const tag of tags) {
                if (tag.count < 5) {
                    // dont display tags with < 5 votes
                    setPropertyTags((prev) => prev.filter((t) => t.tag_id !== tag.tag_id));
                }
            }
        }).catch((error) => {
            console.error("Error fetching property tags: ", error);
        });
    }, [property.id]);

    // handle saving favourite
    async function handleSaveFavourite() {
        try {
            // check user is logged in first
            const user = await validateUser();
            if (!user) {
                toast.error("You must be logged in to save favourites.", { position: "top-right" });
                return;
            }

            // remove from favourites if already favourited
            if (isFavourite) {
                await removeFavourite(property.id, user.user.id);
                toast.success("Property removed from favourites!", { position: "top-right" });
                // set property as not favourited so that UI reflects change immediately without needing to refetch data
                setIsFavourite(false);
            } else {
                await saveFavourite(property.id, user.user.id);
                toast.success("Property saved to favourites!", { position: "top-right" });
                // set property as favourited so that UI reflects change immediately without needing to refetch data
                setIsFavourite(true);
            }
        } catch (error) {
            console.error("Error saving favourite: ", error);
            toast.error("An error occurred while saving favourite.", { position: "top-right" });
        }
    }

    return (
        <Card key={property.id} className={page === "manage" ? "bg-white/90 border-none mb-6 lg:h-60" : "bg-white/90 border-none mb-6"}>
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className={page === "manage" ? "flex flex-col gap-0 md:w-64 shrink-0" : "flex flex-col gap-0 md:w-80 shrink-0"}>
                        <ImageCarousel images={images} property={property} page={page} isModalOpen={null} />
                        <div>
                            <CardHeader className={page === "manage" ? "h-12 p-0 gap-0 m-0 bg-highlight rounded-b-md text-white flex flex-row items-center justify-center" : "p-0 gap-0 m-0 bg-highlight rounded-b-md text-white flex flex-row items-center justify-center md:h-16 lg:h-10"}>
                                <CardTitle className="text-2xl text-center">{'£' + property.price.toLocaleString()}</CardTitle>
                                <p className="text-center text-sm"> &nbsp; {uppercaseWords(property.price_type || '')}</p>
                            </CardHeader>
                        </div>
                    </div>
                    <div className="flex-1 px-4">

                        {/** Title and favourite button */}
                        {(page === "properties" || page === "favourites") && (
                            <div className="flex gap-2 justify-between">
                                <Link href={page === "properties" ? `properties/${property.id}` : `favourites/${property.id}`}>
                                    <CardHeader className="p-1 pt-2">
                                        <CardTitle className="text-xl">{property.title}</CardTitle>
                                    </CardHeader>
                                </Link>
                                <Button onClick={handleSaveFavourite} variant={"link"} className="ml-2 mt-1 p-0 text-sm text-muted-foreground"><Heart className={`size-6 ${isFavourite ? 'fill-current text-red-500' : ''}`} /></Button>
                            </div>
                        )}

                        {/** Title on management page */}
                        {page === "manage" && (
                            <div className="flex gap-2">
                                <CardHeader className="p-1 mt-2 ">
                                    <CardTitle className="text-xl line-clamp-1">{property.title},  {property.post_code}</CardTitle>
                                </CardHeader>
                            </div>
                        )}

                        {/** Main Features display */}
                        <div>
                            {(page === "properties" || page === "favourites") ? (
                                <Link href={page === "properties" ? `properties/${property.id}` : `favourites/${property.id}`}>
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

                        {/** Description */}
                        <div className={page === "properties" || page === "favourites" ? "text-sm text-muted-foreground max-h-[100px] mx-1 mt-2 mb-4 overflow-hidden text-ellipsis line-clamp-3 lg:line-clamp-4" : "text-sm text-muted-foreground max-h-[100px] mx-1 my-1 overflow-hidden text-ellipsis line-clamp-2 lg:line-clamp-3"}>
                            {property.description}
                        </div>

                        {/** Tag display */}
                        <div className="h-8 mb-2">
                            {propertyTags.length > 0 && propertyTags.map((tag) => (
                                <span key={tag.tag_id} className="inline-block bg-buttonColor text-foreground text-xs px-2 py-1 rounded-full mr-2 mb-2">
                                    {tag.name} ({tag.count})
                                </span>
                            ))}
                        </div>

                        {/** Agency details */}
                        {agencyDetails && page !== "manage" && (
                            <div className="flex flex-row items-center gap-4 pb-2 md:py-0">
                                {agencyDetails.logo_url && (
                                    <img
                                        src={agencyDetails.logo_url}
                                        alt="Agency logo"
                                        className="w-20 object-contain"
                                    />
                                )}
                                <div className="flex flex-row ml-auto pr-4 gap-4 items-center">
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

                        {/** Manage property options */}
                        {page === "manage" &&
                            <>
                                {editable ? (
                                    <div className="flex flex-row gap-1 justify-between items-center pt-2">
                                        <div className="flex  flex-row gap-3 items-center">
                                            <p className="font-bold mb-2">Status: <span className={property.status === "active" || property.status === "under offer" ? "text-green-600" : "text-red-600"}><b>{property.status}</b></span></p>
                                            <Link href={`manage-properties/${property.id}/edit-status`}>
                                                <Button variant={"link"}
                                                    className=" mb-2 p-1 text-foreground">Edit Status <Pencil /></Button>
                                            </Link>
                                        </div>
                                        <Link href={`manage-properties/${property.id}/edit`}>
                                            <Button
                                                className="bg-buttonColor hover:bg-buttonColor/90 mb-2 p-1 text-foreground">Edit Property <Pencil /></Button>
                                        </Link>
                                    </div>
                                ) : seller ? (
                                    <div className="flex flex-row gap-1 justify-between items-center pt-2">
                                        <div className="flex  flex-row gap-3 items-center">
                                            <p className="font-bold mb-2">Status: <span className={property.status === "active" || property.status === "under offer" ? "text-green-600" : "text-red-600"}><b>{property.status}</b></span></p>
                                        </div>
                                        <Link href={`manage-properties/${property.id}`}>
                                            <Button className="bg-midBlue hover:bg-midBlueHover mb-2 text-foreground">Edit Seller Details</Button>
                                        </Link>
                                    </div>
                                ) :
                                    (
                                        <div className="flex flex-row gap-1 justify-between items-center pt-2">
                                            <div className="flex  flex-row gap-3 items-center">
                                                <p className="font-bold mb-2">Status: <span className={property.status === "active" || property.status === "under offer" ? "text-green-600" : "text-red-600"}><b>{property.status}</b></span></p>
                                            </div>
                                            <Link href={`manage-properties/${property.id}`}>
                                                <Button className="bg-midBlue hover:bg-midBlueHover mb-2 text-foreground">View Property</Button>
                                            </Link>
                                        </div>
                                    )}
                            </>
                        }
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}
import { Database } from "@/types/supabase";
import styles from '../app/public/properties/page.module.css';
import { Home, Bed, Bath, Grid2X2, Landmark, Lightbulb, BookOpenText, StickyNote, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { loadSellerAddedInfo } from "@/lib/data/property-utils";
import { toast } from "sonner";
import { saveFavourite, removeFavourite } from "@/lib/data/favourites";
import { validateUser } from "@/lib/auth/user";

import SellerDetails from "./seller-details";
import { Button } from "./ui/button";

type Property = Database["public"]["Tables"]["properties"]["Row"] & {isFavourite?: boolean};

// page options are:
// - view: view the property details as a buyer would see them
// - edit: view the property details with the option to edit the seller added info (only for the seller who added the property)
export default function PropertyDetails({ params, page = "view" }: { params: { id: number, property: Property }, page: string }) {
    const { property } = params;
    const [sellerDetails, setSellerDetails] = useState<string | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [isFavourite, setIsFavourite] = useState(false);

    // load seller added info
    useEffect(() => {
        const loadInfo = async () => {
            if (property) {
                const sellerInfo = await loadSellerAddedInfo(property.id);
                if (sellerInfo) {
                    setSellerDetails(sellerInfo.seller_description || null);
                    setReason(sellerInfo.reason_for_selling || null);
                }
            }
        };
        loadInfo();
    }, [property]);

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
        <>
            {property && (
                <div className="px-2 lg:px-4 py-4 col-start-1 col-span-2">
                    <div className="flex flex-row justify-between gap-2 mb-4">
                        <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                        {page === "view" && (
                            <Button onClick={handleSaveFavourite} variant={"link"} className="ml-2 mt-1 p-0 text-sm text-muted-foreground"><Heart className={`size-10 ${isFavourite ? 'fill-current text-red-500' : ''}`} /></Button>
                        )}
                    </div>
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
                    <div className={styles.description + ` ${sellerDetails ? 'mb-8 md:mb-12 lg:mb-4' : 'mb-20 md:mb-28 lg:mb-8'} whitespace:`}>
                        <h1 className={styles.features}>Key Features</h1>
                        <ul>
                            {property.features?.map((feature, index) =>
                                <li key={index}>{feature}</li>
                            )}
                        </ul>
                        <h1>Description</h1>
                        <p>{property.description}</p>
                    </div>
                    {((sellerDetails) || (page === "edit")) && (
                        <SellerDetails property={property} reason={reason} description={sellerDetails} page={page} />
                    )}
                </div>
            )}
        </>
    );
}
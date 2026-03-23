import { Database } from "@/types/supabase";
import styles from '../app/public/properties/page.module.css';
import { Home, Bed, Bath, Grid2X2, Landmark, Lightbulb, BookOpenText, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { loadSellerAddedInfo } from "@/lib/data/property-utils";
import { updateSellerAddedInfo } from "@/lib/data/edit-property";

import SellerDetails from "./seller-details";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function PropertyDetails({ params, page = "view" }: { params: { id: number, property: Property }, page: string }) {
    const { property } = params;
    const [sellerDetails, setSellerDetails] = useState<string | null>(null);
    const [reason, setReason] = useState<string | null>(null);

    // load seller added info
    useEffect(() => {
        const loadInfo = async () => {
            if (property) {
                const sellerInfo = await loadSellerAddedInfo(property.id);
                setSellerDetails(sellerInfo.seller_description || null);
                setReason(sellerInfo.reason_for_selling || null);
            }
        };
        loadInfo();
    }, [property]);

    return (
        <>
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
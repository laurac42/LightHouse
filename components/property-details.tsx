import { Database } from "@/types/supabase";
import styles from '../app/properties/page.module.css';
import { Home, Bed, Bath, Grid2X2, Landmark, Lightbulb, Heart, Car, HousePlus, TreeDeciduous, Warehouse, Footprints, Bike, TrainFront } from "lucide-react";
import { useEffect, useState } from "react";
import { loadSellerAddedInfo } from "@/lib/data/property-utils";
import { toast } from "sonner";
import { saveFavourite, removeFavourite } from "@/lib/data/favourites";
import { validateUser } from "@/lib/auth/user";
import SellerDetails from "./seller-details";
import { Button } from "./ui/button";
import { PropertyTags } from "./property-tags";
import { Card } from "./ui/card";
import { MapComponent } from "./map";
import type { UserLocation } from "@/types/address";

type Property = Database["public"]["Tables"]["properties"]["Row"] & { isFavourite?: boolean };

/**
 * Convert a timestamptz string to a local date string in the format "day month year" (e.g. "1 January 2022")
 * @param timestamptz timestamptz string to convert
 * @returns A local date string in the format "day month year"
 */
function timestamptzToLocalDate(timestamptz: string): string {
    return new Date(timestamptz).toLocaleDateString("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// page options are:
// - view: view the property details as a buyer would see them
// - edit: view the property details with the option to edit the seller added info (only for the seller who added the property)
export default function PropertyDetails({ params, page = "view", locs }: { params: { id: number, property: Property }, page: string, locs: UserLocation[] | [] }) {
    const { property } = params;
    const [sellerDetails, setSellerDetails] = useState<string | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [isFavourite, setIsFavourite] = useState(false);
    const [distances, setDistances] = useState<{ [key: string]: number }>({});
    const [viewFullDescription, setViewFullDescription] = useState<boolean>(false);

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

    useEffect(() => {
        if (locs.length > 0) {
            locs.forEach((location) => {
                fetch('/api/distance-matrix', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        lat1: property.latitude ?? 0,
                        long1: property.longitude ?? 0,
                        lat2: location.latitude,
                        long2: location.longitude,
                        travel_mode: location.travel_mode
                    })
                }).then(response => response.json()).then(data => {
                    setDistances(prev => ({ ...prev, [location.id]: data.distance }));
                }).catch(error => console.error("Error fetching distance:", error));
            });
        }
    }, [property.id, locs]);

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
                    <div className="mb-4 flex flex-col gap-1">
                        <div className="flex flex-row justify-between gap-2">
                            <h1 className="text-3xl font-bold">{property.title}</h1>
                            {page === "view" && (
                                <Button onClick={handleSaveFavourite} variant={"link"} className="ml-2 mt-1 p-0 text-sm text-muted-foreground"><Heart className={`size-10 ${isFavourite ? 'fill-current text-red-500' : ''}`} /></Button>
                            )}
                        </div>
                        <div className="mb-2 justify-between flex flex-row gap-2 mt-1">
                            <p className="text-muted-foreground">{property.address_line_1}, {property.address_line_2 ? `${property.address_line_2}, ` : ""} {property.city} {property.post_code}</p>
                            <p className="text-muted-foreground">Added on {timestamptzToLocalDate(property.added_at)}</p>
                        </div>
                        <div className="text-2xl text-primary">
                            <b> £{property.price.toLocaleString()}</b> <span className="text-lg">{property.price_type}</span>
                        </div>
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
                        <div className="inline-flex items-center gap-1 font-bold">
                            <HousePlus size={16} />
                            New Build: {property.is_new_build ? "Yes" : "No"}
                        </div>
                        <div className="inline-flex items-center gap-1 font-bold">
                            <Warehouse size={16} />
                            Garage: {property.has_garage ? "Yes" : "No"}
                        </div>
                        <div className="inline-flex items-center gap-1 font-bold">
                            <TreeDeciduous size={16} />
                            Garden: {property.garden ? "Yes" : "No"}
                        </div>
                        <div className="inline-flex items-center gap-1 font-bold">
                            <Car size={16} />
                            Driveway: {property.driveway ? "Yes" : "No"}
                        </div>

                    </div>
                    <hr />

                    <div className={styles.description + ` mt-6 pr-2 mb-8 md:mb-12 lg:mb-4 whitespace:`}>
                        <h1 className={styles.features}>Key Features</h1>
                        <ul>
                            {property.features?.map((feature, index) =>
                                <li key={index}>{feature}</li>
                            )}
                        </ul>
                        <Card className="p-4 border-none mt-12 mb-12">
                            <h1 >Description</h1>
                            <p className={viewFullDescription ? "" : "overflow-hidden text-ellipsis line-clamp-4"}>{property.description}</p>
                            {viewFullDescription ? (
                                <Button variant={"link"} className="p-0 mt-2 text-highlight" onClick={() => setViewFullDescription(false)}>View less</Button>
                            ) : (
                                <Button variant={"link"} className="p-0 mt-2 text-highlight" onClick={() => setViewFullDescription(true)}>View more</Button>
                            )}
                        </Card>
                    </div>

                    <div className="mb-8">
                        <PropertyTags propertyId={property.id} />

                    </div>

                    {/* Map */}
                    <Card className="border-none mb-12">
                        {property.latitude !== null && property.longitude !== null ? (
                            MapComponent(property.latitude, property.longitude, locs)
                        ) : null}

                        {/* Distance From Locations */}
                        <div className="pb-4 mb-2 mx-4 flex flex-col gap-2 mb-16">
                            <p className="text-highlight text-sm">Add new locations from <a href='/protected/profile/locations' className="underline hover:underline">your profile page</a></p>
                            {locs.length > 0 && locs.map((location) => (
                                <p key={location.id} className="text-md text-foreground flex items-center gap-1 inline-flex">
                                    {location.travel_mode === "driving" ? <Car /> : location.travel_mode === "walking" ? <Footprints /> : location.travel_mode === "transit" ? <TrainFront /> : <Bike />}
                                    {distances[location.id] !== undefined ? distances[location.id] : 'Loading...'} {location.travel_mode === "driving" ? "drive" : location.travel_mode === "walking" ? "walk" : location.travel_mode === "transit" ? "transit" : "cycle"} from <b>{location.nickname}</b>
                                </p>
                            ))}
                        </div>
                    </Card>

                    {((sellerDetails) || (page === "edit")) && (
                        <SellerDetails property={property} reason={reason} description={sellerDetails} page={page} />
                    )}
                </div>
            )}
        </>
    );
}
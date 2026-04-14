"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { getImagesFromStorage } from "@/lib/data/images";
import { validateUser } from "@/lib/auth/user";
import { useRouter } from "next/navigation";
import PropertyCard from "@/components/property-card";

type Property = Database["public"]["Tables"]["properties"]["Row"] & { images: string[], isFavourite?: boolean };

export default function FavouritesPage() {
    const router = useRouter();
    const [favouriteProperties, setFavouriteProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchProperties() {
        setLoading(true);
        const supabase = await createClient();
        const { data: properties, error } = await supabase
            .rpc("fetch_users_favourite_properties");

        if (error) {
            console.error("Error fetching properties:", error);
            return;
        }
        if (!properties) {
            setFavouriteProperties([]);
            return;
        }
        // fetch images simultaneously for all properties
        const entries = await Promise.all(
            (properties ?? []).map(async (property) => {
                const imageUrls = await getImagesFromStorage(property.id);
                return { property, imageUrls };
            })
        )

        const propertiesList: Property[] = [];
        for (const { property, imageUrls } of entries) {
            if (!imageUrls) continue;
            propertiesList.push({ ...property, images: imageUrls, isFavourite: true });
        }
        setFavouriteProperties(propertiesList);
        setLoading(false);
    }


    useEffect(() => {
        fetchProperties();
    }, []);

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Favourite Properties</CardTitle>
                            <CardDescription>View and manage your favourite properties.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-gray-500 text-center">Loading your favourite properties...</p>
                            ) : favouriteProperties.length === 0 ? (
                                <p className="text-gray-500 text-center">You have no favourite properties yet.</p>
                            ) : (
                                <div>
                                    {favouriteProperties.map((property) => (
                                        <PropertyCard key={property.id} property={property} images={property.images} page="favourites" locationsForDistance={[]} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
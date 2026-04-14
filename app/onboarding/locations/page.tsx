'use client';
import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PersonalLocationAddress } from "@/types/address";
import { getLatitudeLongitudeFromPostcode } from "@/lib/data/location";
import AddLocation from "@/components/add-location";
import { createClient } from "@/lib/supabase/client";
import { addPersonalLocation } from "@/lib/data/location";


export default function PersonalLocations() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<Partial<PersonalLocationAddress> | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const supabase = createClient();

    async function addLocation() {
        if (!currentLocation?.address_line_1 || !currentLocation.city || !currentLocation.post_code || !currentLocation.nickname) {
            setErrorMessage("Please fill in all required fields (Address Line 1, City, Post Code, Nickname)");
            return;
        }
        setErrorMessage("");
        setSuccessMessage("");
        setLoading(true);
        const coordinates = await getLatitudeLongitudeFromPostcode(currentLocation.post_code);

        if (!coordinates) {
            setErrorMessage("Postcode not found. Please check the postcode and try again.");
            setLoading(false);
            return;
        }

        try {
            const { data } = await supabase.auth.getClaims();
            const user = data?.claims;
            const userId = user?.user_metadata?.sub || "";
            await addPersonalLocation(userId, currentLocation as PersonalLocationAddress, coordinates.latitude, coordinates.longitude);        
        } catch (error) {
            console.error("Error adding personal location:", error);
            setErrorMessage("Failed to add location");
        }
        setSuccessMessage("Location added successfully!");
            setLoading(false);
        }


    return (
            <div className="bg-background w-full min-h-svh">
                <Navbar />
                <div className="flex w-full items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-lg">
                        <div className="flex flex-col gap-6">
                            <Card className="bg-white/90 border-none">
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Your Locations
                                    </CardTitle>
                                    <CardDescription>Enter any locations important to you. You can use these locations to sort properties, as well as view their location on a map in relation to properties.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {successMessage ? (
                                        <div className="p-4 mb-4 justify-center items-center flex flex-col">
                                            <p className="text-green-600 mb-6 text-md">{successMessage}</p>
                                            <p className="text-lg">Add another location?</p>
                                            <div className="flex flex-row items-center justify-center gap-4 mt-4">
                                                <Button onClick={() => { setErrorMessage(""); setSuccessMessage(""); setCurrentLocation(null); }} className="text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Add Another</Button>
                                                <Button onClick={() => { setErrorMessage(""); router.push("/"); }} className="text-sm text-foreground bg-gray-300 hover:bg-gray-400 shadow-md">No, I'm Done</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <Label className="py-2 text-xl" htmlFor="address">Add a Location</Label>

                                            <AddLocation currentLocation={currentLocation} setCurrentLocation={setCurrentLocation} />

                                            <Button type="button" onClick={addLocation} className="w-full mt-6 text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md" disabled={loading}>
                                                {loading ? "Adding..." : "Add Location"}
                                            </Button>
                                        </div>
                                    )}
                                    {!successMessage &&
                                        <div className="flex justify-end">
                                            <Button onClick={() => router.push("/")} className="text-sm text-foreground bg-gray-300 hover:bg-gray-400 shadow-md mt-4 w-1/3 flex">Skip this step</Button>
                                        </div>
                                    }
                                    {errorMessage && <p className="text-sm text-red-500 pt-4">{errorMessage}</p>}

                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

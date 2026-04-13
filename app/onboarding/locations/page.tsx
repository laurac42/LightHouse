'use client';
import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import type { PersonalLocationAddress } from "@/types/address";
import { getLatitudeLongitudeFromPostcode } from "@/lib/data/location";
import { CarFront, Bike, TrainFront, Footprints } from "lucide-react";


export default function PersonalLocations() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<Partial<PersonalLocationAddress> | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");

    async function addLocation() {
        if (!currentLocation?.address_line_1 || !currentLocation.city || !currentLocation.post_code) {
            setErrorMessage("Please fill in all required fields (Address Line 1, City, Post Code)");
            return;
        }
        setErrorMessage("");
        setLoading(true);
        const coordinates = await getLatitudeLongitudeFromPostcode(currentLocation.post_code);

        if (!coordinates) {
            setErrorMessage("Postcode not found. Please check the postcode and try again.");
            setLoading(false);
            return;
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
                                            <Button onClick={() => { setSuccessMessage(""); setCurrentLocation(null); }} className="text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Add Another</Button>
                                            <Button onClick={() => router.push("/")} className="text-sm text-foreground bg-gray-300 hover:bg-gray-400 shadow-md">No, I'm Done</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Label className="py-2 text-xl" htmlFor="address">Add a Location</Label>

                                        <FieldSet className="w-full">
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
                                                    <Input id="nickname" type="text" placeholder="e.g. Work or Mum's House" />
                                                    <FieldDescription>
                                                        Choose a nickname to help you identify this location, e.g. "Work" or "Mum's House".
                                                    </FieldDescription>
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="travel_mode">Travel Mode</FieldLabel>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose travel mode" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="driving"><span className="flex inline-flex items-center gap-2">Driving <CarFront /></span></SelectItem>
                                                                <SelectItem value="walking"><span className="flex inline-flex items-center gap-2">Walking <Footprints /></span></SelectItem>
                                                                <SelectItem value="cycling"><span className="flex inline-flex items-center gap-2">Cycling <Bike /></span></SelectItem>
                                                                <SelectItem value="public_transport"><span className="flex inline-flex items-center gap-2">Public Transport <TrainFront /></span></SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldDescription>
                                                        How do you want to travel to this location?
                                                    </FieldDescription>
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="address_line_1">Address Line 1</FieldLabel>
                                                    <Input id="address_line_1" type="text" value={currentLocation?.address_line_1 || ""} placeholder="123 Main Street" onChange={(e) => setCurrentLocation({ ...currentLocation, address_line_1: e.target.value })} />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="address_line_2">Address Line 2</FieldLabel>
                                                    <Input id="address_line_2" type="text" value={currentLocation?.address_line_2 || ""} placeholder="Flat, etc." onChange={(e) => setCurrentLocation({ ...currentLocation, address_line_2: e.target.value })} />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="city ">City</FieldLabel>
                                                    <Input id="city" type="text" value={currentLocation?.city || ""} placeholder="e.g. Dundee" onChange={(e) => setCurrentLocation({ ...currentLocation, city: e.target.value })} />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="post_code">Post Code</FieldLabel>
                                                    <Input id="post_code" type="text" value={currentLocation?.post_code || ""} placeholder="e.g. DD1..." onChange={(e) => setCurrentLocation({ ...currentLocation, post_code: e.target.value })} />
                                                </Field>
                                            </FieldGroup>
                                        </FieldSet>

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

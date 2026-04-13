import type { Dispatch, SetStateAction } from "react";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { PersonalLocationAddress, UserLocation } from "@/types/address";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CarFront, Footprints, Bike, TrainFront, Trash2 } from "lucide-react";
import { getLatitudeLongitudeFromPostcode, editPersonalLocation, addPersonalLocation } from "@/lib/data/location";
import AddLocation from "./add-location";
import ConfirmLocationDeletion from "./dialogs/confirm-location-deletion";

type EditProfileLocationsProps = {
    userDetails?: User;
    userLocations: UserLocation[] | null;
    setUserLocations: Dispatch<SetStateAction<UserLocation[] | null>>;
};

export default function EditProfileLocations({
    userDetails,
    userLocations,
    setUserLocations
}: EditProfileLocationsProps) {
    const [editing, setEditing] = useState<string>("");
    const [locationBeingEdited, setLocationBeingEdited] = useState<Partial<UserLocation> | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [postcodeChanged, setPostcodeChanged] = useState<boolean>(false);
    const [adding, setAdding] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [locationToAdd, setLocationToAdd] = useState<Partial<PersonalLocationAddress> | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [locationIdToDelete, setLocationIdToDelete] = useState<string>("");
    // save changes of a location being edited
    async function saveChanges() {
        try {
            setErrorMessage("");
            setSuccessMessage("");
            console.log("locationBeingEdited in saveChanges: ", locationBeingEdited);

            // get new coordinates if postcode has changed
            if (postcodeChanged && locationBeingEdited?.post_code) {
                const coordinates = await getLatitudeLongitudeFromPostcode(locationBeingEdited.post_code);
                if (!coordinates) {
                    setErrorMessage("Postcode not found. Please check the postcode and try again.");
                    return;
                }
            }
            const data = await editPersonalLocation(locationBeingEdited as UserLocation);
            if (!data) {
                setErrorMessage("Update failed. Please try again");
            } else {
                setEditing("");
                setErrorMessage("");
                setPostcodeChanged(false);

                // update user locations for instant page refresh
                setUserLocations((prevLocations) => {
                    if (!prevLocations) return prevLocations;
                    return prevLocations.map((loc) => (loc.id === locationBeingEdited?.id ? (data[0] as UserLocation) : loc));
                });
            }
        } catch (error) {
            setErrorMessage("Unable to update location: " + error);
        }
    }

    // add a new location
    async function addLocation() {
        try {
            if (!locationToAdd?.address_line_1 || !locationToAdd.city || !locationToAdd.post_code || !locationToAdd.nickname) {
                setErrorMessage("Please fill in all required fields (Address Line 1, City, Post Code, Nickname)");
                return;
            }
            if (!userDetails?.id) {
                setErrorMessage("Unable to add new location. Please check you are logged in to your account.")
                return;
            }

            setErrorMessage("");
            setSuccessMessage("");
            setLoading(true);
            const coordinates = await getLatitudeLongitudeFromPostcode(locationToAdd.post_code);
            if (!coordinates) {
                setErrorMessage("Postcode not found. Please check the postcode and try again.");
                setLoading(false);
                return;
            }

            const newLocation = await addPersonalLocation(userDetails?.id, locationToAdd as PersonalLocationAddress, coordinates.latitude, coordinates.longitude);

            // update user locations for instant page refresh
            setUserLocations((prevLocations) => {
                if (!prevLocations) return [newLocation];
                return [...prevLocations, newLocation];
            });

            setLoading(false);
            setAdding(false);
        } catch (error) {
            setErrorMessage("Unable to add location: " + error);
            setLoading(false);
            return;
        }
    }

    return (
        <div className="flex flex-col gap-4 w-full pl-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-2xl">Your Locations</h2>
                <Button className="w-1/3 md:w-1/4 ml-auto bg-buttonColor text-foreground hover:bg-buttonHover" disabled={editing !== ""} onClick={() => setAdding(true)}>Add New Location</Button>
            </div>
            <p>View and edit your locations</p>
            <ConfirmLocationDeletion confirm={confirmDelete} setConfirm={setConfirmDelete} locationId={locationIdToDelete} locations={userLocations} setUserLocations={setUserLocations}/>

            {!adding ? (
                userLocations && userLocations.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {userLocations.map((location) => (
                            <div key={location.id} className="border rounded-md p-4">
                                <div className="flex justify-between">
                                    <h3 className="text-xl">{location.nickname}</h3>
                                    {editing === location.id ? (
                                        <Button className="flex inline-flex bg-buttonColor hover:bg-buttonHover text-foreground" onClick={saveChanges}>Save</Button>
                                    ) : (
                                        <Button className="flex inline-flex bg-buttonColor hover:bg-buttonHover text-foreground" disabled={editing !== "" && editing !== location.id} onClick={() => { setEditing(location.id); setLocationBeingEdited(location); }}>Edit <SquarePen /></Button>
                                    )}
                                </div>
                                {editing === location.id ? (
                                    <div className="flex flex-col gap-4 mt-2">
                                        <div>
                                            <Label className="text-sm text-foreground/80">Nickname</Label>
                                            <Input placeholder="Nickname" value={locationBeingEdited?.nickname ?? ""} onChange={(e) => setLocationBeingEdited({ ...locationBeingEdited, nickname: e.target.value })} />
                                        </div>

                                        <div>
                                            <Label className="text-sm text-foreground/80">Address Line 1</Label>
                                            <Input placeholder="Address Line 1" value={locationBeingEdited?.address_line_1 ?? ""} onChange={(e) => setLocationBeingEdited({ ...locationBeingEdited, address_line_1: e.target.value })} />
                                        </div>

                                        <div>
                                            <Label className="text-sm text-foreground/80">Address Line 2</Label>
                                            <Input placeholder="Address Line 2" value={locationBeingEdited?.address_line_2 ?? ""} onChange={(e) => setLocationBeingEdited({ ...locationBeingEdited, address_line_2: e.target.value })} />

                                        </div>

                                        <div>
                                            <Label className="text-sm text-foreground/80">City</Label>
                                            <Input placeholder="City" value={locationBeingEdited?.city ?? ""} onChange={(e) => setLocationBeingEdited({ ...locationBeingEdited, city: e.target.value })} />
                                        </div>

                                        <div>
                                            <Label className="text-sm text-foreground/80">Post Code</Label>
                                            <Input placeholder="Post Code" value={locationBeingEdited?.post_code ?? ""} onChange={(e) => { setPostcodeChanged(true); setLocationBeingEdited({ ...locationBeingEdited, post_code: e.target.value }) }} />

                                        </div>

                                        <div>
                                            <Label className="text-sm text-foreground/80">Travel Mode</Label>
                                            <Field>
                                                <Select
                                                    value={locationBeingEdited?.travel_mode || ""}
                                                    onValueChange={(value) => setLocationBeingEdited({ ...locationBeingEdited, travel_mode: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose travel mode" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="driving"><span className="flex inline-flex items-center gap-2">Driving <CarFront /></span></SelectItem>
                                                            <SelectItem value="walking"><span className="flex inline-flex items-center gap-2">Walking <Footprints /></span></SelectItem>
                                                            <SelectItem value="bicycling"><span className="flex inline-flex items-center gap-2">Cycling <Bike /></span></SelectItem>
                                                            <SelectItem value="transit"><span className="flex inline-flex items-center gap-2">Public Transport <TrainFront /></span></SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        </div>
                                        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                                        {successMessage && <p className="text-green-600">{successMessage}</p>}
                                    </div>
                                ) : (
                                    <>
                                        <p>{location.address_line_1}</p>
                                        {location.address_line_2 && <p>{location.address_line_2}</p>}
                                        <p>{location.city}, {location.post_code}</p>
                                        <div className="flex justify-between">
                                            <p>Travel Mode: {location.travel_mode === "bicycling" ? "cycling" : location.travel_mode === "transit" ? "public transport" : location.travel_mode}</p>
                                            <Button className="bg-transparent hover:bg-red-200" onClick={() => { setConfirmDelete(true); setLocationIdToDelete(location.id); }}>
                                                <Trash2 className="size-6 text-red-500"/>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <p>You have not added any locations yet.</p>
                    </div>
                )
            ) : (
                <div className="p-2">
                    <AddLocation currentLocation={locationToAdd} setCurrentLocation={setLocationToAdd} />
                    <Button className="w-full mt-6 text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md" disabled={loading} onClick={addLocation}>{loading ? "Adding Location ..." : "Add Location"}</Button>
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                </div>
            )}
        </div>
    );
}
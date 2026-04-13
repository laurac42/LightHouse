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
import { CarFront, Footprints, Bike, TrainFront } from "lucide-react";
import { useState } from "react";
import type { PersonalLocationAddress } from "@/types/address";
import { Input } from "@/components/ui/input";

export default function AddLocation({ currentLocation, setCurrentLocation, errorMessage }: { currentLocation: Partial<PersonalLocationAddress> | null; setCurrentLocation: React.Dispatch<React.SetStateAction<Partial<PersonalLocationAddress> | null>>; errorMessage: string }) {

    return (
        <FieldSet className="w-full">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
                    <Input id="nickname" type="text" placeholder="e.g. Work or Mum's House" value={currentLocation?.nickname || ""} onChange={(e) => setCurrentLocation({ ...currentLocation, nickname: e.target.value })} />
                    <FieldDescription>
                        Choose a nickname to help you identify this location, e.g. "Work" or "Mum's House".
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="travel_mode">Travel Mode</FieldLabel>
                    <Select
                        value={currentLocation?.travel_mode || ""}
                        onValueChange={(value) => setCurrentLocation({ ...currentLocation, travel_mode: value })}>
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
    );
}
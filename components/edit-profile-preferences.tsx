import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import type { User, UserPreferences } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type EditProfilePreferencesProps = {
    userDetails?: User;
    userPreferences: UserPreferences | null;
    setUserPreferences: Dispatch<SetStateAction<UserPreferences | null>>;
    inputLocation: string;
    setInputLocation: Dispatch<SetStateAction<string>>;
    editing: boolean;
    onToggleEdit: () => void;
};

export default function EditProfilePreferences({
    userDetails,
    userPreferences,
    setUserPreferences,
    inputLocation,
    setInputLocation,
    editing,
    onToggleEdit,
}: EditProfilePreferencesProps) {
    return (
        <>
            {userDetails?.user_goals?.includes('buying') ? (
                <div className="flex flex-col gap-4 w-full ml-4">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl">Buyer Preferences</h2>
                        <Button onClick={onToggleEdit} className="w-1/3 md:w-1/4 ml-auto bg-buttonColor text-foreground hover:bg-buttonHover">{editing ? 'Save Changes' : 'Edit Details'}</Button>
                    </div>
                    <p>Set your property preferences to help us find you your perfect home.</p>

                    {editing ? (
                        <Field className="pr-4">
                            <FieldLabel className="text-sm text-foreground/80">Budget</FieldLabel>
                            <Input
                                value={userPreferences?.budget ?? ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserPreferences({ ...userPreferences, budget: e.target.value ? Number(e.target.value) : null } as UserPreferences)}
                                className="ml-2"
                            />
                        </Field>
                    ) : (
                        <div>
                            <Label className="text-sm text-foreground/80">Budget</Label>
                            <Label className="text-md w-full p-2 py-1 rounded-md m-2">{'£ ' + userPreferences?.budget?.toLocaleString() || 'No budget set'}</Label>
                        </div>
                    )}
                    {editing ? (
                        <Field className="pr-4">
                            <FieldLabel className="text-sm text-foreground/80">Preferred Number of Bedrooms</FieldLabel>
                            <Input
                                value={userPreferences?.preferred_num_bedrooms ?? ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserPreferences({ ...userPreferences, preferred_num_bedrooms: e.target.value ? Number(e.target.value) : null } as UserPreferences)}
                                className="ml-2"
                            />
                        </Field>
                    ) : (
                        <div>
                            <Label className="text-sm text-foreground/80">Preferred Number of Bedrooms</Label>
                            <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userPreferences?.preferred_num_bedrooms || 'No number of bedrooms set'}</Label>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <FieldSet>
                            <FieldLegend variant="label" className="text-sm text-foreground/80">
                                What property types are you interested in?
                            </FieldLegend>
                            <FieldGroup className="grid grid-cols-2 gap-3">
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="detached-checkbox" name="detached-checkbox" checked={userPreferences?.preferred_property_types?.includes('detached')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "detached"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "detached");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="detached-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Detached
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="semi-detached-checkbox" name="semi-detached-checkbox" checked={userPreferences?.preferred_property_types?.includes('semi-detached')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "semi-detached"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "semi-detached");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="semi-detached-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Semi-detached
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="terraced-checkbox" name="terraced-checkbox" checked={userPreferences?.preferred_property_types?.includes('terraced')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "terraced"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "terraced");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="terraced-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Terraced
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="flat-checkbox" name="flat-checkbox" checked={userPreferences?.preferred_property_types?.includes('flat')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "flat"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "flat");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="flat-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Flat
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="bungalow-checkbox" name="bungalow-checkbox" checked={userPreferences?.preferred_property_types?.includes('bungalow')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "bungalow"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "bungalow");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="bungalow-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Bungalow
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="land-checkbox" name="land-checkbox" checked={userPreferences?.preferred_property_types?.includes('land')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "land"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "land");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="land-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Land
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight data-[disabled]:opacity-100" id="commercial-checkbox" name="commercial-checkbox" checked={userPreferences?.preferred_property_types?.includes('commercial')}
                                        onCheckedChange={(checked) => {
                                            const updatedPreferences = checked
                                                ? [...(userPreferences?.preferred_property_types || []), "commercial"]
                                                : (userPreferences?.preferred_property_types || []).filter(type => type !== "commercial");
                                            setUserPreferences({ ...userPreferences, preferred_property_types: updatedPreferences } as UserPreferences);
                                        }}
                                        disabled={!editing}
                                    />
                                    <FieldLabel htmlFor="commercial-checkbox" className="font-normal peer-disabled:opacity-100">
                                        Commercial Property
                                    </FieldLabel>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </div>
                    <div className="flex flex-col gap-2">
                        {editing ?
                            <FieldGroup className="mt-4 text-foreground/80" >
                                <Field>
                                    <FieldLabel htmlFor="locations-input">Are there any specific locations you're interested in?</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="locations-input"
                                            placeholder="Enter a location..."
                                            value={inputLocation}
                                            onChange={(e) => setInputLocation(e.target.value)}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                size="xs"
                                                className="bg-buttonColor hover:bg-buttonHover text-foreground ml-auto"
                                                onClick={() => {
                                                    if (inputLocation.trim() !== "") {
                                                        setUserPreferences({ ...userPreferences, preferred_locations: [...(userPreferences?.preferred_locations || []), inputLocation.trim()] } as UserPreferences);
                                                        setInputLocation("");
                                                    }
                                                }}
                                            >
                                                Add +
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>
                            </FieldGroup> : (

                                <Label className="text-sm text-foreground/80 mt-4">Preferred Locations</Label>
                            )}
                        {(userPreferences?.preferred_locations ?? []).length > 0 ?
                            (<div className="flex flex-wrap gap-2 mb-8">
                                {(userPreferences?.preferred_locations ?? []).map((location, index) => (
                                    <Badge key={index} variant="outline" className="bg-midBlue text-foreground border-foreground">
                                        {location}
                                        {editing &&
                                            <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => {
                                                if (userPreferences) {
                                                    setUserPreferences({ ...userPreferences, preferred_locations: (userPreferences.preferred_locations || []).filter((_, i) => i !== index) });
                                                }
                                            }}>
                                                X
                                            </Button>}
                                    </Badge>
                                ))}
                            </div>) : (
                                <Label className="text-md w-full p-2 py-1 rounded-md m-2 mb-8">No preferred locations set </Label>
                            )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 w-1/2">
                    <h2 className="text-xl ">Buyer Preferences</h2>
                    <p>Select 'Buying' as a goal to set buyer preferences.</p>
                </div>
            )}
        </>
    );
}
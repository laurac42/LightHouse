"use client";
import { validateUser, fetchUserDetails, fetchUserPreferences, updateUserDetails, updateUserPreferences } from "@/lib/auth/user";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import type { User, UserPreferences } from "@/types/user";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldLabel, Field, FieldSet, FieldLegend, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { isAdmin, isEstateAgent } from "@/lib/auth/role";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import ConfirmDeletion from "@/components/dialogs/confirm-deletion";

export default function ProfilePage() {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<User>();
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [profileOption, setProfileOption] = useState<string>("profile");
    const [isAdminOrAgent, setIsAdminOrAgent] = useState<boolean>(false);
    const [inputLocation, setInputLocation] = useState<string>("");
    const [confirm, setConfirm] = useState<boolean>(false);

    useEffect(() => {
        async function checkUser() {
            try {
                const user = await validateUser();
                if (!user || !user.user.id) {
                    router.push("/public/home");
                    return;
                }
                setUserDetails({ ...userDetails, id: user.user.id } as User);

                const admin = await isAdmin();
                const agent = await isEstateAgent();
                if (admin || agent) {
                    setIsAdminOrAgent(true);
                }
            } catch (error) {
                console.error("Error fetching user");
            }

        }
        checkUser();
    }, [router]);

    // once user is set, fetch their profile information and display it on the page
    useEffect(() => {
        async function fetchProfile() {
            if (!userDetails) return;
            try {
                const details = await fetchUserDetails(userDetails.id);
                if (details) {
                    setUserDetails({ ...userDetails, email: details.email, first_name: details.first_name, last_name: details.last_name, user_goals: details.user_goals } as User);
                }
                if (details?.user_goals?.includes('buying')) {
                    fetchUserPreferences(userDetails.id).then((preferences) => {
                        setUserPreferences(preferences);
                        console.log("preferences set")
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        }
        fetchProfile();
    }, [userDetails?.id])

    // get users intiials to display in profile icon
    function getInitials() {
        if (!userDetails) return "";
        const firstInitial = userDetails.first_name ? userDetails.first_name.charAt(0).toUpperCase() : "";
        const lastInitial = userDetails.last_name ? userDetails.last_name.charAt(0).toUpperCase() : "";
        return firstInitial + lastInitial;
    }

    // save users update changes
    async function saveChanges() {
        try {
            setErrorMessage("");
            setSuccessMessage("");
            if (userDetails) {
                await updateUserDetails(userDetails);
            }
            setSuccessMessage("User details successfully updated");
        } catch (error) {
            setErrorMessage("Unable to update details: " + error);
        }
    }

    // save preference update changes
    async function savePreferences() {
        try {
            setErrorMessage("");
            setSuccessMessage("");
            if (userPreferences) {
                await updateUserPreferences(userPreferences);
            }
            setSuccessMessage("User preferences successfully updated");
        } catch (error) {
            setErrorMessage("Unable to update preferences: " + error);
        }
    }

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Your Profile</CardTitle>
                            <CardDescription>
                                Manage your profile information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConfirmDeletion confirm={confirm} setConfirm={setConfirm}/>
                            <div className="flex flex-row gap-8">
                                <div className="flex flex-col">
                                    <Button onClick={() => { setProfileOption("profile"); setErrorMessage(""); setSuccessMessage(""); }} variant={"ghost"} className={`rounded-none border-b-2 px-3 ${profileOption === "profile"
                                        ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                        }`}>Profile</Button>
                                    {/** Agents and admin should not have goals or buyer preferences */}
                                    {!isAdminOrAgent &&
                                        <>
                                            <Button onClick={() => { setProfileOption("goals"); setErrorMessage(""); setSuccessMessage(""); }} variant={"ghost"} className={`rounded-none border-b-2 px-3 ${profileOption === "goals"
                                                ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                                }`}>Goals</Button>
                                            <Button onClick={() => { setProfileOption("preferences"); setErrorMessage(""); setSuccessMessage(""); }} variant={"ghost"} className={`rounded-none border-b-2 px-3 ${profileOption === "preferences"
                                                ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                                }`}>Preferences</Button>
                                        </>
                                    }
                                </div>
                                <div className="flex flex-row gap-12 w-full">
                                    {profileOption !== "preferences" &&
                                        <div className="flex flex-col items-center">
                                            <div className="w-48 h-48 flex rounded-full bg-navBar border border-highlight text-highlight text-5xl flex items-center justify-center mb-4 ">
                                                {getInitials()}
                                            </div>
                                            <Label className="text-center text-lg mb-8">{userDetails?.first_name} {userDetails?.last_name}</Label>
                                        </div>
                                    }
                                    {profileOption === "profile" &&
                                        <div className="flex flex-col gap-4 w-1/2">
                                            <div>
                                                <Label className="text-sm text-foreground/80">Email Address</Label>
                                                <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userDetails?.email}</Label>
                                            </div>
                                            {editing ? (
                                                <>
                                                    <Field>
                                                        <FieldLabel className="text-sm text-foreground/80">First Name</FieldLabel>
                                                        <Input
                                                            value={userDetails?.first_name}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserDetails({ ...userDetails, first_name: e.target.value } as User)}
                                                            className="ml-2"
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel className="text-sm text-foreground/80">Last Name</FieldLabel>
                                                        <Input
                                                            value={userDetails?.last_name}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserDetails({ ...userDetails, last_name: e.target.value } as User)}
                                                            className="ml-2"
                                                        />
                                                    </Field>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <Label className="text-sm text-foreground/80">First Name </Label>
                                                        <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userDetails?.first_name}</Label>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm text-foreground/80">Last Name </Label>
                                                        <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userDetails?.last_name}</Label>
                                                    </div>
                                                </>

                                            )}

                                            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                                            {successMessage && <p className="text-green-600">{successMessage}</p>}
                                            <Button onClick={() => { setEditing(!editing); if (editing) { saveChanges() } else { setErrorMessage(""); setSuccessMessage(""); } }} className="w-1/3 ml-auto bg-buttonColor text-foreground hover:bg-buttonHover">{editing ? 'Save Changes' : 'Edit Details'}</Button>

                                            <div className="bg-red-100 border border-red-600 rounded-md my-8 p-4">
                                                <h1 className="text-lg font-bold mb-4">Danger Zone</h1>

                                                <p className="text-sm mb-3">Warning!! This action will permanently delete your profile</p>
                                                <Button onClick={() => setConfirm(true)} className="bg-red-600 hover:bg-red-700">Delete Profile</Button>
                                            </div>
                                        </div>
                                    }
                                    {profileOption === "goals" &&
                                        <div className="flex flex-col gap-4 w-1/2">
                                            <FieldSet>
                                                <FieldLegend variant="label">
                                                    What are you using LightHouse for?
                                                </FieldLegend>
                                                <FieldGroup className="gap-3">
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="buying-checkbox" name="buying-checkbox" checked={userDetails?.user_goals.includes("buying")}
                                                            onCheckedChange={(checked) => {
                                                                const updatedGoals = checked
                                                                    ? [...(userDetails?.user_goals || []), "buying"]
                                                                    : (userDetails?.user_goals || []).filter(goal => goal !== "buying");
                                                                setUserDetails({ ...userDetails, user_goals: updatedGoals } as User);
                                                            }}
                                                        />
                                                        <FieldLabel htmlFor="buying-checkbox" className="font-normal">
                                                            Buying
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="selling-checkbox" name="selling-checkbox" checked={userDetails?.user_goals.includes("selling")}
                                                            onCheckedChange={(checked) => {
                                                                const updatedGoals = checked
                                                                    ? [...(userDetails?.user_goals || []), "selling"]
                                                                    : (userDetails?.user_goals || []).filter(goal => goal !== "selling");
                                                                setUserDetails({ ...userDetails, user_goals: updatedGoals } as User);
                                                            }} />
                                                        <FieldLabel htmlFor="selling-checkbox" className="font-normal">
                                                            Selling
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="browsing-checkbox" name="browsing-checkbox" checked={userDetails?.user_goals.includes("browsing")}
                                                            onCheckedChange={(checked) => {
                                                                const updatedGoals = checked
                                                                    ? [...(userDetails?.user_goals || []), "browsing"]
                                                                    : (userDetails?.user_goals || []).filter(goal => goal !== "browsing");
                                                                setUserDetails({ ...userDetails, user_goals: updatedGoals } as User);
                                                            }}
                                                        />
                                                        <FieldLabel htmlFor="browsing-checkbox" className="font-normal">
                                                            Just Browsing
                                                        </FieldLabel>
                                                    </Field>
                                                </FieldGroup>
                                            </FieldSet>

                                            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                                            {successMessage && <p className="text-green-600">{successMessage}</p>}
                                            <Button onClick={() => { setEditing(!editing); if (editing) { saveChanges() } }} className="w-1/3 mt-8 bg-buttonColor text-foreground hover:bg-buttonHover">Save Changes</Button>
                                        </div>
                                    }
                                    {profileOption === "preferences" &&
                                        <>
                                            {userDetails?.user_goals.includes('buying') ? (
                                                <div className="flex flex-col gap-4 w-full ml-8">
                                                    <div className="flex flex-row justify-between items-center">
                                                        <h2 className="text-2xl">Buyer Preferences</h2>
                                                        <Button onClick={() => { setEditing(!editing); if (editing) { savePreferences() } else { setErrorMessage(""); setSuccessMessage(""); } }} className="w-1/4 ml-auto bg-buttonColor text-foreground hover:bg-buttonHover">{editing ? 'Save Changes' : 'Edit Details'}</Button>
                                                    </div>
                                                    <p>Set your property preferences to help us find you your perfect home.</p>

                                                    {editing ? (
                                                        <Field>
                                                            <FieldLabel className="text-sm text-foreground/80">Budget</FieldLabel>
                                                            <Input
                                                                value={userPreferences?.budget ?? ""}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPreferences({ ...userPreferences, budget: e.target.value ? Number(e.target.value) : null } as UserPreferences)}
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
                                                        <Field>
                                                            <FieldLabel className="text-sm text-foreground/80">Family Size</FieldLabel>
                                                            <Input
                                                                value={userPreferences?.family_size ?? ""}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPreferences({ ...userPreferences, family_size: e.target.value ? Number(e.target.value) : null } as UserPreferences)}
                                                                className="ml-2"
                                                            />
                                                        </Field>
                                                    ) : (
                                                        <div>
                                                            <Label className="text-sm text-foreground/80">Family Size</Label>
                                                            <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userPreferences?.family_size || 'No family size set'}</Label>
                                                        </div>
                                                    )}
                                                    {editing ? (
                                                        <Field>
                                                            <FieldLabel className="text-sm text-foreground/80">Preferred Number of Bedrooms</FieldLabel>
                                                            <Input
                                                                value={userPreferences?.preferred_num_bedrooms ?? ""}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPreferences({ ...userPreferences, preferred_num_bedrooms: e.target.value ? Number(e.target.value) : null } as UserPreferences)}
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
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </Card >
                </div >
            </div >
        </div >
    );
}
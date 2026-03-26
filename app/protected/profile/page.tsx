"use client";

import { validateUser, fetchUserDetails, updateUserDetails } from "@/lib/auth/user";
import { fetchUserPreferences, updateUserPreferences } from "@/lib/data/buyer-profile";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, UserPreferences } from "@/types/user";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldLabel, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { isAdmin, isEstateAgent } from "@/lib/auth/role";
import ConfirmDeletion from "@/components/dialogs/confirm-deletion";
import EditProfileGoals from "@/components/edit-profile-goals";
import EditProfilePreferences from "@/components/edit-profile-preferences";
import { createClient } from "@/lib/supabase/client";

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
                const supabase = createClient();
                const { data } = await supabase.auth.getClaims();
                const user = data?.claims;
                setUserDetails({ ...userDetails, id: user?.user_metadata?.sub } as User);

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

    useEffect(() => {
        async function fetchProfile() {
            if (!userDetails) return;
            try {
                const details = await fetchUserDetails(userDetails.id);
                if (details) {
                    setUserDetails({
                        ...userDetails,
                        email: details.email,
                        first_name: details.first_name,
                        last_name: details.last_name,
                        user_goals: details.user_goals,
                    } as User);
                }
                if (details?.user_goals?.includes("buying")) {
                    fetchUserPreferences(userDetails.id).then((preferences) => {
                        setUserPreferences(preferences);
                        console.log("preferences set");
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        }
        fetchProfile();
    }, [userDetails?.id]);

    function getInitials() {
        if (!userDetails) return "";
        const firstInitial = userDetails.first_name ? userDetails.first_name.charAt(0).toUpperCase() : "";
        const lastInitial = userDetails.last_name ? userDetails.last_name.charAt(0).toUpperCase() : "";
        return firstInitial + lastInitial;
    }

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
                            <CardDescription>Manage your profile information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConfirmDeletion confirm={confirm} setConfirm={setConfirm} />
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex flex-row md:flex-col">
                                    <Button
                                        onClick={() => {
                                            setProfileOption("profile");
                                            setErrorMessage("");
                                            setSuccessMessage("");
                                        }}
                                        variant={"ghost"}
                                        className={`rounded-none border-b-2 px-3 ${profileOption === "profile"
                                            ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                            }`}
                                    >
                                        Profile
                                    </Button>
                                    {!isAdminOrAgent && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    setProfileOption("goals");
                                                    setErrorMessage("");
                                                    setSuccessMessage("");
                                                }}
                                                variant={"ghost"}
                                                className={`rounded-none border-b-2 px-3 ${profileOption === "goals"
                                                    ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                                    }`}
                                            >
                                                Goals
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setProfileOption("preferences");
                                                    setErrorMessage("");
                                                    setSuccessMessage("");
                                                }}
                                                variant={"ghost"}
                                                className={`rounded-none border-b-2 px-3 ${profileOption === "preferences"
                                                    ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                                    }`}
                                            >
                                                Preferences
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full items-center md:items-stretch">
                                        {profileOption !== "preferences" && (
                                            <div className="flex flex-col items-center md:ml-12">
                                                <div className="w-32 h-32 md:w-48 md:h-48 flex rounded-full bg-navBar border border-highlight text-highlight text-5xl items-center justify-center mb-4">
                                                    {getInitials()}
                                                </div>
                                                <Label className="text-center text-lg mb-8">
                                                    {userDetails?.first_name} {userDetails?.last_name}
                                                </Label>
                                            </div>
                                        )}

                                        {profileOption === "profile" && (
                                            <div className="flex flex-col gap-4 md:w-1/2">
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
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                    setUserDetails({ ...userDetails, first_name: e.target.value } as User)
                                                                }
                                                                className="ml-2"
                                                            />
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel className="text-sm text-foreground/80">Last Name</FieldLabel>
                                                            <Input
                                                                value={userDetails?.last_name}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                    setUserDetails({ ...userDetails, last_name: e.target.value } as User)
                                                                }
                                                                className="ml-2"
                                                            />
                                                        </Field>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <Label className="text-sm text-foreground/80">First Name</Label>
                                                            <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userDetails?.first_name}</Label>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm text-foreground/80">Last Name</Label>
                                                            <Label className="text-md w-full p-2 py-1 rounded-md m-2">{userDetails?.last_name}</Label>
                                                        </div>
                                                    </>
                                                )}

                                                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                                                {successMessage && <p className="text-green-600">{successMessage}</p>}

                                                <Button
                                                    onClick={() => {
                                                        setEditing(!editing);
                                                        if (editing) {
                                                            saveChanges();
                                                        } else {
                                                            setErrorMessage("");
                                                            setSuccessMessage("");
                                                        }
                                                    }}
                                                    className="w-full sm:w-1/2 md:w-1/3 ml-auto bg-buttonColor text-foreground hover:bg-buttonHover"
                                                >
                                                    {editing ? "Save Changes" : "Edit Details"}
                                                </Button>

                                            </div>
                                        )}

                                        {profileOption === "goals" && (
                                            <EditProfileGoals
                                                userDetails={userDetails}
                                                setUserDetails={setUserDetails}
                                                errorMessage={errorMessage}
                                                successMessage={successMessage}
                                                editing={editing}
                                                setEditing={setEditing}
                                                saveChanges={saveChanges}
                                            />
                                        )}

                                        {profileOption === "preferences" && (
                                            <EditProfilePreferences
                                                userDetails={userDetails}
                                                userPreferences={userPreferences}
                                                setUserPreferences={setUserPreferences}
                                                inputLocation={inputLocation}
                                                setInputLocation={setInputLocation}
                                                editing={editing}
                                                onToggleEdit={() => {
                                                    setEditing(!editing);
                                                    if (editing) {
                                                        savePreferences();
                                                    } else {
                                                        setErrorMessage("");
                                                        setSuccessMessage("");
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    {profileOption === "profile" && (
                                        <div className="bg-red-100 border border-red-600 rounded-md my-12 p-4 mx-auto  flex flex-col items-center">
                                            <h1 className="text-lg font-bold mb-4">Danger Zone</h1>
                                            <p className="text-sm mb-3">Warning!! This action will permanently delete your profile</p>
                                            <Button onClick={() => setConfirm(true)} className="bg-red-600 hover:bg-red-700">
                                                Delete Profile
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

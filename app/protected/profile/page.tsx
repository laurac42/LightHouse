"use client";
import { validateUser, fetchUserDetails } from "@/lib/auth/user";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldLabel, Field, FieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateUserDetails } from "@/lib/auth/user";
import { isAdmin, isEstateAgent } from "@/lib/auth/role";

export default function ProfilePage() {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<User>();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [profileOption, setProfileOption] = useState<string>("profile")
    const [isAdminOrAgent, setIsAdminOrAgent] = useState<boolean>(false);

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
                    setUserDetails({ ...userDetails, email: details.email, first_name: details.first_name, last_name: details.last_name } as User);
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
            if (userDetails) {
                await updateUserDetails(userDetails);
            }
        } catch (error) {
            setErrorMessage("Unable to update details: " + error);
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
                            <div className="flex flex-row gap-8">
                                <div className="flex flex-col">
                                    <Button onClick={() => setProfileOption("profile")} variant={"ghost"} className={`rounded-none border-b-2 px-3 ${profileOption === "profile"
                                        ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                        }`}>Profile</Button>
                                    {/** Agents and admin should not have goals or buyer preferences */}
                                    <Button onClick={() => setProfileOption("goals")} variant={"ghost"} className={`rounded-none border-b-2 px-3 ${profileOption === "goals"
                                        ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                        }`}>Goals</Button>
                                    <Button onClick={() => setProfileOption("preferences")} variant={"ghost"} className={`rounded-none border-b-2 px-3 ${profileOption === "preferences"
                                        ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                                        }`}>Preferences</Button>
                                </div>
                                <div className="flex flex-row gap-8 w-full">
                                    <div className="flex flex-col items-center">
                                        <div className="w-48 h-48 flex rounded-full bg-navBar border border-highlight text-highlight text-5xl flex items-center justify-center mb-4 ">
                                            {getInitials()}
                                        </div>
                                        <Label className="text-center text-lg">{userDetails?.first_name} {userDetails?.last_name}</Label>
                                    </div>
                                    {profileOption === "profile" &&
                                        <div className="flex flex-col gap-4 w-1/2">
                                            <div>
                                                <Label>Email Address</Label>
                                                <Label className="border border-gray-400 w-full p-2 py-3 rounded-md m-2">{userDetails?.email}</Label>
                                            </div>
                                            {editing ? (
                                                <>
                                                    <Field>
                                                        <FieldLabel>First Name</FieldLabel>
                                                        <Input
                                                            value={userDetails?.first_name}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserDetails({ ...userDetails, first_name: e.target.value } as User)}
                                                            className="ml-2"
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel>Last Name</FieldLabel>
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
                                                        <Label>First Name </Label>
                                                        <Label className="border border-gray-400 w-full p-2 py-3 rounded-md m-2">{userDetails?.first_name}</Label>
                                                    </div>
                                                    <div>
                                                        <Label>Last Name </Label>
                                                        <Label className="border border-gray-400 w-full p-2 py-3 rounded-md m-2">{userDetails?.last_name}</Label>
                                                    </div>
                                                </>

                                            )}

                                            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                                            <Button onClick={() => { setEditing(!editing); if (editing) { saveChanges() } }} className="w-1/4 ml-auto bg-buttonColor text-foreground hover:bg-buttonHover">{editing ? 'Save Changes' : 'Edit Details'}</Button>
                                        </div>
                                    }
                                    {profileOption === "goals" &&
                                        <div className="flex flex-col gap-4 w-1/2">
                                            <div>
                                                <Label>Your Goals</Label>
                                                {userDetails?.user_goals && userDetails.user_goals.length > 0 ? (
                                                    <div className="space-y-2 mt-2">
                                                        {userDetails.user_goals.map((goal, index) => (
                                                            <div key={index} className="border border-gray-400 p-3 rounded-md">
                                                                <p className="font-medium">{goal}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground mt-2">No goals set yet</p>
                                                )}
                                            </div>
                                        </div>
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
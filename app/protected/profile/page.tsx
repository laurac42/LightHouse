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

export default function ProfilePage() {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<User>();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        async function checkUser() {
            const user = await validateUser();
            if (!user || !user.user.id) {
                router.push("/public/home");
                return;
            }
            setUserDetails({ ...userDetails, id: user.user.id } as User);
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

    function getInitials() {
        if (!userDetails) return "";
        const firstInitial = userDetails.first_name ? userDetails.first_name.charAt(0).toUpperCase() : "";
        const lastInitial = userDetails.last_name ? userDetails.last_name.charAt(0).toUpperCase() : "";
        return firstInitial + lastInitial;
    }

    async function saveChanges() {
        try {
            if (userDetails) {
                await updateUserDetails(userDetails)
                console.log("saved details")
            }
        } catch (error) {
            setErrorMessage("Unable to update details: " + error)
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
                                <div className="w-48 h-48 flex rounded-full bg-navBar border border-highlight text-highlight text-5xl flex items-center justify-center mb-4 ">
                                    {getInitials()}
                                </div>
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
                            </div>
                        </CardContent>
                    </Card >
                </div >
            </div >
        </div >
    );
}
"use client";

import { useState, type ChangeEvent } from "react";
import { updateUserDetails } from "@/lib/auth/user";
import type { User } from "@/types/user";
import ProfilePageShell from "@/components/profile-page-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldLabel, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import ConfirmDeletion from "@/components/dialogs/confirm-deletion";
import { useProfileData } from "@/hooks/use-profile-data";

export default function ProfilePage() {
    const { userDetails, setUserDetails, isAdminOrAgent } = useProfileData();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [confirm, setConfirm] = useState<boolean>(false);

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

    return (
        <ProfilePageShell
            title="Your Profile"
            description="Manage your profile information."
            isAdminOrAgent={isAdminOrAgent}
        >
            <ConfirmDeletion confirm={confirm} setConfirm={setConfirm} />
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full items-center md:items-stretch">
                <div className="flex flex-col items-center md:ml-12">
                    <div className="w-32 h-32 md:w-48 md:h-48 flex rounded-full bg-navBar border border-highlight text-highlight text-5xl items-center justify-center mb-4">
                        {getInitials()}
                    </div>
                    <Label className="text-center text-lg mb-8">
                        {userDetails?.first_name} {userDetails?.last_name}
                    </Label>
                </div>

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
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setUserDetails({ ...userDetails, first_name: e.target.value } as User)
                                    }
                                    className="ml-2"
                                />
                            </Field>
                            <Field>
                                <FieldLabel className="text-sm text-foreground/80">Last Name</FieldLabel>
                                <Input
                                    value={userDetails?.last_name}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
            </div>

            <div className="bg-red-100 border border-red-600 rounded-md my-12 p-4 mx-auto flex flex-col items-center">
                <h1 className="text-lg font-bold mb-4">Danger Zone</h1>
                <p className="text-sm mb-3">Warning!! This action will permanently delete your profile</p>
                <Button onClick={() => setConfirm(true)} className="bg-red-600 hover:bg-red-700">
                    Delete Profile
                </Button>
            </div>
        </ProfilePageShell>
    );
}

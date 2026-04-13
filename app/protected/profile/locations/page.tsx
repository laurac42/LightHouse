"use client";

import { useState } from "react";
import { updateUserDetails } from "@/lib/auth/user";
import { Label } from "@/components/ui/label";
import EditLocations from "@/components/edit-locations";
import ProfilePageShell from "@/components/profile-page-shell";
import { useProfileData } from "@/hooks/use-profile-data";

export default function ProfileLocationsPage() {
    const { userDetails, setUserDetails, isAdminOrAgent } = useProfileData();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    /**
     * Gets the initials of the user to display in the profile avatar. If the user's first or last name is missing, it will return an empty string for that part.
     * @returns The firsta and last initial of the user
     */
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
            setSuccessMessage("User goals successfully updated");
        } catch (error) {
            setErrorMessage("Unable to update goals: " + error);
        }
    }

    return (
        <ProfilePageShell
            title="Your Locations"
            description="Manage your locations."
            isAdminOrAgent={isAdminOrAgent}
        >
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full items-center md:items-stretch">

                <EditLocations
                    userDetails={userDetails}
                    setUserDetails={setUserDetails}
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                    editing={editing}
                    setEditing={setEditing}
                    saveChanges={saveChanges}
                />
            </div>
        </ProfilePageShell>
    );
}

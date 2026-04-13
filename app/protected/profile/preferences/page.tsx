"use client";

import { useState } from "react";
import { updateUserPreferences } from "@/lib/data/buyer-profile";
import EditProfilePreferences from "@/components/edit-profile-preferences";
import ProfilePageShell from "@/components/profile-page-shell";
import { useProfileData } from "@/hooks/use-profile-data";

export default function ProfilePreferencesPage() {
    const {
        userDetails,
        userPreferences,
        setUserPreferences,
        inputLocation,
        setInputLocation,
        isAdminOrAgent,
    } = useProfileData();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

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
        <ProfilePageShell
            title="Your Preferences"
            description="Manage your buyer preferences."
            isAdminOrAgent={isAdminOrAgent}
        >
            {errorMessage && <p className="text-red-600 mb-3">{errorMessage}</p>}
            {successMessage && <p className="text-green-600 mb-3">{successMessage}</p>}
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
        </ProfilePageShell>
    );
}

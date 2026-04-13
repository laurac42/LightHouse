"use client";

import { useEffect, useState } from "react";
import EditLocations from "@/components/edit-locations";
import ProfilePageShell from "@/components/profile-page-shell";
import { useProfileData } from "@/hooks/use-profile-data";
import type { UserLocation } from "@/types/address";
import { createClient } from "@/lib/supabase/client";

export default function ProfileLocationsPage() {
    const { userDetails, setUserDetails, isAdminOrAgent } = useProfileData();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [buyerLocations, setBuyerLocations] = useState<UserLocation[] | null>(null);
    const supabase = createClient();

    // fetch the user's locations from db
    useEffect(() => {
        async function fetchLocations() {
            if (!userDetails?.id) return;
            try {
                await supabase
                    .from("user_locations")
                    .select("*")
                    .eq("user_id", userDetails.id)
                    .then((response) => {
                        if (response.error) {
                            setErrorMessage("Unable to fetch locations: " + response.error.message);
                        } else {
                            setBuyerLocations(response.data);
                        }
                    });
            } catch (error) {
                setErrorMessage("Unable to fetch locations: " + error);
            }
        }

        fetchLocations();
    }, [userDetails?.id, ]);

    return (
        <ProfilePageShell
            title="Your Locations"
            description="Manage your locations."
            isAdminOrAgent={isAdminOrAgent}
        >
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full items-center md:items-stretch">

                <EditLocations
                    userDetails={userDetails}
                    userLocations={buyerLocations}
                    setUserLocations={setBuyerLocations}
                />
            </div>
        </ProfilePageShell>
    );
}

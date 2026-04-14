"use client";

import { useEffect, useState } from "react";
import { fetchUserDetails } from "@/lib/auth/user";
import { fetchUserPreferences } from "@/lib/data/buyer-profile";
import { isAdmin, isEstateAgent } from "@/lib/auth/role";
import { createClient } from "@/lib/supabase/client";
import type { User, UserPreferences } from "@/types/user";

export function useProfileData() {
    const [userDetails, setUserDetails] = useState<User>();
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [isAdminOrAgent, setIsAdminOrAgent] = useState<boolean>(false);
    const [inputLocation, setInputLocation] = useState<string>("");

    useEffect(() => {
        async function checkUser() {
            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getClaims();
                const claims = data?.claims;
                const userId = (claims?.sub as string | undefined) ?? (claims?.user_metadata?.sub as string | undefined);

                if (userId) {
                    setUserDetails((previous) => ({ ...previous, id: userId } as User));
                }

                const admin = await isAdmin();
                const agent = await isEstateAgent();
                setIsAdminOrAgent(admin || agent);
            } catch (error) {
                console.error("Error fetching user");
            }
        }

        checkUser();
    }, []);

    useEffect(() => {
        async function fetchProfile() {
            if (!userDetails?.id) return;

            try {
                const details = await fetchUserDetails(userDetails.id);
                if (details) {
                    setUserDetails((previous) => ({
                        ...previous,
                        id: previous?.id ?? userDetails.id,
                        email: details.email,
                        first_name: details.first_name,
                        last_name: details.last_name,
                        user_goals: details.user_goals,
                    } as User));
                }
                if (details?.user_goals?.includes("buying")) {
                    const preferences = await fetchUserPreferences(userDetails.id);
                    setUserPreferences(preferences);
                } else {
                    setUserPreferences(null);
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        }

        fetchProfile();
    }, [userDetails?.id]);

    return {
        userDetails,
        setUserDetails,
        userPreferences,
        setUserPreferences,
        isAdminOrAgent,
        inputLocation,
        setInputLocation,
    };
}

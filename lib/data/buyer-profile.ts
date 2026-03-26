import { createClient } from "@/lib/supabase/client";
import { UserPreferences } from "@/types/user";

/**
 * Fetch user preferences from the buyer profiles table for a given user ID
 * @param userId id of the user to fetch preferences for
 * @returns user preferences such as budget, property type and preferred locations
 * @throws error if there is an issue fetching the user preferences from the database
 * @remarks This function assumes that the user preferences are stored in a table called "buyer_profiles" and that the user ID is used as the primary key for that table. If the database schema changes, this function may need to be updated accordingly.
 */
export async function fetchUserPreferences(userId: string) {
    const supabase = createClient();
    const { data: userPreferences, error } = await supabase
        .from("buyer_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }
    console.log("budget: ", userPreferences?.budget);
    return userPreferences;
}

/**
 * Update user preferences in the buyer profiles table for a given user ID
 * @param preferences preferences to update for the user
 */
export async function updateUserPreferences(preferences: UserPreferences) {
    const supabase = createClient();
    const { error } = await supabase
        .from("buyer_profiles")
        .update({ budget: preferences.budget, family_size: preferences.family_size, preferred_num_bedrooms: preferences.preferred_num_bedrooms, preferred_locations: preferences.preferred_locations, preferred_property_types: preferences.preferred_property_types, })
        .eq('id', preferences.id);
    
    if (error) {
        throw error;
    }
}
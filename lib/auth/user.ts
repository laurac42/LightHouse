import { createClient } from "@/lib/supabase/client"

/**
 * Checks if the user is authenticated by attempting to fetch their details from Supabase. 
 * If the user is not authenticated, it returns null, else returns the user data.
 * @returns boolean indicating whether the user is authenticated or not
 */
export async function validateUser() {
    try {
        const supabase = await createClient();
        const { data: user, error } = await supabase.auth.getUser();
        if (error) {
            throw error;
        } else if (!user) {
            throw new Error("No user found");
        }
        return user;
    } catch (error) {
        console.error("Unexpected error validating user:", error);
        return null;
    }
}
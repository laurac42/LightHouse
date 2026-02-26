import { createClient } from "@/lib/supabase/client";

/**
 * Checks if a user has an admin role by querying the "user_roles" table in Supabase.
 * @param userId the ID of the user to check
 * @returns boolean indicating whether the user is an admin or not
 */
export async function isAdmin() {
    try {
        const supabase = await createClient();
        const { data: isAdmin, error } = await supabase.rpc('is_current_user_admin')

        if (error) {
            throw error;
        }
        return isAdmin;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}
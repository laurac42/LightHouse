import { createClient } from "@/lib/supabase/client";

/**
 * Checks if a user has an admin role by querying the "user_roles" table in Supabase.
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

/**
 * Checks if a user with a specific ID has an admin role
 * @param userId id to check for admin
 * @returns boolean indicating whether the user is an admin or not
 */
export async function isAdminById(userId: string) {
    try {
        const supabase = await createClient();
        const { data: isAdmin, error } = await supabase.rpc('is_user_admin', { p_id: userId })

        if (error) {
            throw error;
        }
        return isAdmin;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

/**
 * Checks if a user has an estate agent role by querying the "user_roles" table in Supabase.
 * @returns boolean indicating whether the user is an estate agent or not
 */
export async function isEstateAgent() {
    try {
        const supabase = await createClient();
        const { data: isEstateAgent, error } = await supabase.rpc('is_current_user_agent')

        if (error) {
            throw error;
        }
        return isEstateAgent;
    } catch (error) {
        console.error("Error checking estate agent status:", error);
        return false;
    }
}

/**
 * Checks if a user with a specific ID has an estate agent role
 * @param userId id to check for agent
 * @returns boolean indicating whether the user is an agent or not
 */
export async function isEstateAgentById(userId: string) {
    try {
        const supabase = await createClient();
        const { data: isEstateAgent, error } = await supabase.rpc('is_user_estate_agent', { p_id: userId })

        if (error) {
            throw error;
        }
        return isEstateAgent;
    } catch (error) {
        console.error("Error checking estate agent status:", error);
        return false;
    }
}

/**
 * Checks if a user has a seller role by querying the "user_roles" table in Supabase.
 * @param userId id to check for seller
 * @returns boolean indicating whether the user is a seller or not
 */
export async function isSeller(userId: string) {
    try {
        const supabase = await createClient();
        const { data: isSeller, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'seller')
        .maybeSingle();

        if (error || !isSeller) {
            throw error;
        }
        return isSeller ? true : false;
    } catch (error) {
        return false;
    }
}
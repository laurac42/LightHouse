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

/** 
 * Checks if a user with a specific email has a seller role
 * @param email email to check for seller role
 * @returns boolean indicating whether the user with the given email is a seller or not
 */
export async function isSellerByEmail(email: string) {
    const supabase = await createClient();
    const { data: isSeller, error } = await supabase
        .rpc('is_seller_by_email', { p_email: email })

    if (error) {
        throw error;
    }
    console.log("Fetched seller status: ", isSeller);
    return isSeller;
}

/**
 * Fetches the ID of a user with a given email address
 * @param email email address to fetch the corresponding user ID of
 * @returns The ID of the user
 */
export async function getIdByEmail(email: string) {
    const supabase = await createClient();
    const { data: userId, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (error || !userId) {
        throw error;
    }
    return userId;
}

/**
 * Fetch the agency location ID of the agency that a given agent works at
 * @param agentId ID to check the agency location of
 * @returns The ID of the agnency location the agent works at
 */
export async function getAgentsLocationId(agentId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("estate_agent_profiles")
            .select("estate_agency_location_id")
            .eq("id", agentId)
            .single();

        if (!data || error) {
            throw error ? error : new Error("Unable to fetch agency location ID");
        }
        console.log("Fetched agency location ID: ", data);
        return data;
    } catch (error) {
        console.error("Error fetching agency location ID", error);
        return null;
    }
}
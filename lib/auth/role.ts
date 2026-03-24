import { createClient } from "@/lib/supabase/client";

/**
 * Checks if a user has an admin role by querying the "user_roles" table in Supabase.
 * @returns boolean indicating whether the user is an admin or not
 */
export async function isAdmin() {
    const supabase = await createClient();
    const { data: isAdmin, error } = await supabase.rpc('is_current_user_admin')

    if (error) {
        throw error;
    }
    return isAdmin;
}

/**
 * Checks if a user with a specific ID has an admin role
 * @param userId id to check for admin
 * @returns boolean indicating whether the user is an admin or not
 */
export async function isAdminById(userId: string) {
    const supabase = await createClient();
    const { data: isAdmin, error } = await supabase.rpc('is_user_admin', { p_id: userId })

    if (error) {
        throw error;
    }
    return isAdmin;
}

/**
 * Checks if a user has an estate agent role by querying the "user_roles" table in Supabase.
 * @returns boolean indicating whether the user is an estate agent or not
 */
export async function isEstateAgent() {

    const supabase = await createClient();
    const { data: isEstateAgent, error } = await supabase.rpc('is_current_user_agent')

    if (error) {
        throw error;
    }
    return isEstateAgent;
}

/**
 * Checks if a user with a specific ID has an estate agent role
 * @param userId id to check for agent
 * @returns boolean indicating whether the user is an agent or not
 */
export async function isEstateAgentById(userId: string) {
    const supabase = await createClient();
    const { data: isEstateAgent, error } = await supabase.rpc('is_user_estate_agent', { p_id: userId })

    if (error) {
        throw error;
    }
    return isEstateAgent;
}

/**
 * Checks if a user has a seller role by querying the "user_roles" table in Supabase.
 * @param userId id to check for seller
 * @returns boolean indicating whether the user is a seller or not
 */
export async function isSeller(userId: string) {
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
    return isSeller;
}

/**
 * Fetch the agency location ID of the agency that a given agent works at
 * @param agentId ID to check the agency location of
 * @returns The ID of the agnency location the agent works at
 */
export async function getAgentsLocationId(agentId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("estate_agent_profiles")
        .select("estate_agency_location_id")
        .eq("id", agentId)
        .single();

    if (!data || error) {
        throw error ? error : new Error("Unable to fetch agency location ID");
    }
    return data;

}
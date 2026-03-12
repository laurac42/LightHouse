import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { create } from "domain";
import DOMPurify from "dompurify"

type Property = Database["public"]["Tables"]["properties"]["Row"];

/** 
 * Fetch details of an individual property by ID from Supabase storage
 * @param id ID of the property to fetch details for
 * @returns Promise resolving to the property details or null if not found
 */
export async function fetchPropertyDetails(id: number): Promise<Property | null> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("Error fetching property details:", error);
        return null;
    }
}

/**
 * Gets agency details (email, phone number, logo) for a given agency location ID
 * @param agencyId Id of the agency location to get details of
 * @returns Agency details or null if not found
 */
export async function getAgencyDetails(agencyId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('getagencylocationdetails', { p_id: agencyId });

        if (error || !data) { throw error || new Error("No data returned from RPC"); }

        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error("Error fetching agency details: ", error);
        return null;
    }
}


/**
  * Sanitize property description to prevent XSS attacks, allowing only basic formatting tags
  * @param description Property description to sanitize
  * @returns Sanitized description safe for rendering as HTML
  */
export function sanitizeDescription(description: string | null) {
    if (!description) return "";
    return DOMPurify.sanitize(description, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'ul', 'li', 'p', 'br', 'h1'] });
}

/**
 * 
 * @param locationId ID of the agency location to fetch properties from
 * @return Number of properties returned, and array of properties from the given estate agency location, or null
 */
export async function fetchPropertiesByLocationID(locationId: string, page: number=1, page_size: number=10) {
    try {
        const supabase = await createClient();
        const {data, error, count} = await supabase
        .from("properties")
        .select("*", {count: "exact"})
        .range((page - 1) * page_size, page * page_size - 1)
        .eq("agency_location_id", locationId);

        if (!data || error) {
            throw error ? error : new Error("No properties available at the given Estate Agency Location.");
        }
        console.log(count)
        return { count, data };
    } catch(error) {
        console.error("Error fetching properties by location ID", error);
        return null;
    }
}

/**
 * Fetch properties assigned to a specific agent (i.e. where agent_id matches)
 * @param agentId User ID of the estate agent
 * @param page Page number (1-based)
 * @param page_size Number of results per page
 * @returns Count and array of properties, or null on error
 */
export async function fetchPropertiesByAgentID(agentId: string, page: number = 1, page_size: number = 10) {
    try {
        const supabase = await createClient();
        const { data, error, count } = await supabase
            .from("properties")
            .select("*", { count: "exact" })
            .range((page - 1) * page_size, page * page_size - 1)
            .eq("agent_id", agentId);

        if (!data || error) {
            throw error ? error : new Error("No properties found for the given agent.");
        }
        return { count, data };
    } catch (error) {
        console.error("Error fetching properties by agent ID", error);
        return null;
    }
}

export async function doesPropertyBelongToAgent(propertyId: number, agentId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("agent_id", agentId)
        .maybeSingle();

        if (error) {
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error("Error checking property ownership: ", error);
        return false;
    }   
}

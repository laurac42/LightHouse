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
 * @param locationId 
 * @return Array of properties from the given estate agency location, or null
 */
export async function fetchPropertiesByLocationID(locationId: string) {
    try {
        const supabase = await createClient();
        const {data, error} = await supabase
        .from("properties")
        .select("*")
        .eq("agency_location_id", locationId);

        if (!data || error) {
            throw error ? error : new Error("No properties available at the given Estate Agency Location.");
        }
        return data;
    } catch(error) {
        console.error("Error fetching properties by location ID", error);
        return null;
    }
}


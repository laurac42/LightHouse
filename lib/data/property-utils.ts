import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import type { UserPreferences } from "@/types/user";

type Property = Database["public"]["Tables"]["properties"]["Row"];

/** 
 * Fetch details of an individual property by ID from Supabase storage
 * @param id ID of the property to fetch details for
 * @returns Promise resolving to the property details or null if not found
 */
export async function fetchPropertyDetails(id: number): Promise<Property | null> {
    try {
        const supabase = createClient();
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
        const supabase = createClient();
        const { data, error } = await supabase.rpc('getagencylocationdetails', { p_id: agencyId });

        if (error || !data) { throw error || new Error("No data returned from RPC"); }

        return Array.isArray(data) ? data[0] : data;
    } catch (error) {
        console.error("Error fetching agency details: ", error);
        return null;
    }
}

/**
 * Fetch properties assigned to a specific agency location (i.e. where agency_location_id matches)
 * @param locationId ID of the agency location to fetch properties from
 * @param page Page number (1-based)
 * @param page_size Number of results per page
 * @param status Optional status filter
 * @return Number of properties returned, and array of properties from the given estate agency location, or null
 */
export async function fetchPropertiesByLocationID(locationId: string, page: number = 1, page_size: number = 10, status?: string) {
    try {
        const supabase = createClient();
        let query = supabase
            .from("properties")
            .select("*", { count: "exact" })
            .eq("agency_location_id", locationId);

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error, count } = await query
            .range((page - 1) * page_size, page * page_size - 1);

        if (!data || error) {
            throw error ? error : new Error("No properties available at the given Estate Agency Location.");
        }
        console.log(count)
        return { count, data };
    } catch (error) {
        console.error("Error fetching properties by location ID", error);
        return null;
    }
}

/**
 * Fetch properties assigned to a specific agent (i.e. where agent_id matches)
 * @param agentId User ID of the estate agent
 * @param page Page number (1-based)
 * @param page_size Number of results per page
 * @param status Optional status filter
 * @returns Count and array of properties, or null on error
 */
export async function fetchPropertiesByAgentID(agentId: string, page: number = 1, page_size: number = 10, status?: string) {
    try {
        const supabase = createClient();
        let query = supabase
            .from("properties")
            .select("*", { count: "exact" })
            .eq("agent_id", agentId);

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error, count } = await query
            .range((page - 1) * page_size, page * page_size - 1);

        if (!data || error) {
            throw error ? error : new Error("No properties found for the given agent.");
        }
        return { count, data };
    } catch (error) {
        console.error("Error fetching properties by agent ID", error);
        return null;
    }
}

/**
 * Fetch properties assigned to a specific seller (i.e. where seller_id matches)
 * @param sellerId Id of the seller to fetch properties for
 * @param page page number (1-based)
 * @param page_size number of results per page
 * @param status status filter (optional)
 * @returns 
 */
export async function fetchPropertiesBySellerID(sellerId: string, page: number = 1, page_size: number = 10, status?: string) {
    try {
        const supabase = createClient();
        let query = supabase
            .from("properties")
            .select("*", { count: "exact" })
            .eq("seller_id", sellerId);

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error, count } = await query
            .range((page - 1) * page_size, page * page_size - 1);

        if (!data || error) {
            throw error ? error : new Error("No properties found for the given seller.");
        }
        return { count, data };
    } catch (error) {
        console.error("Error fetching properties by seller ID", error);
        return null;
    }
}

/**
 * Check if a property belongs to a given agent
 * @param propertyId Id of the property to check
 * @param agentId Id of the agent to check
 * @returns boolean indicating whether the property belongs to the agent, or false if an error occurs
 */
export async function doesPropertyBelongToAgent(propertyId: number, agentId: string) {
    try {
        const supabase = createClient();
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

/**
 * Make all words in a string uppercase
 * @param string string to convert
 * @returns string with all words in uppercase
 */
export function uppercaseWords(str: string) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Fetch the status of a property with a given ID
 * @param propertyId Property ID to fetch status of
 * @returns The status of the given property
 */
export async function fetchPropertyStatus(propertyId: number) {
    const supabase = createClient();
    const { data, error } = await supabase.from("properties")
        .select("status")
        .eq("id", propertyId)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Load seller added information for a given property ID, such as the seller's reason for selling and any additional comments they have added about the property
 * @param propertyId Id of the property to load seller added information for
 * @returns Seller added information for the given property ID, or null if not found
 */
export async function loadSellerAddedInfo(propertyId: number) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("property_seller_info")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

    if (error) {
        throw error;
    }
    return data;
}

/**
 * Fetch properties for a given search results page, one page at a time
 * @param page Page number to fetch properties for - default is 1
 * @param page_size size of the page to fetch - default is 10
 * @param preferences Optional user preferences to use for filtering the properties
 * @returns Promise resolving to an object containing the properties and total count of properties matching the search criteria, or null on error
 */
export async function fetchPropertiesForPage(page: number = 1, page_size: number = 10, preferences?: UserPreferences | null) {
    if (preferences) {
        console.log("fetching ranked properties with preferences: ", preferences);
        return await fetchRankedPropertiesWithPreferences(page, page_size, preferences);

    } else {
        console.log("fetching ranked properties without preferences");
        return await fetchRankedPropertiesWithoutPreferences(page, page_size);
    }
}

/**
 * Fetch properties for a given search results page, ranked according to user preferences
 * @param page page number to fetch properties for - default is 1
 * @param page_size size of the page to fetch - default is 10
 * @param preferences User preferences to use for ranking the properties
 * @returns Promise resolving to an object containing the ranked properties and total count of properties matching the search criteria, or null on error
 */
async function fetchRankedPropertiesWithPreferences(page: number, page_size: number, preferences: UserPreferences) {
    const supabase = createClient();
    const { data, error } = await supabase
        .rpc("fetch_ranked_properties", {
            p_preferred_num_bedrooms: preferences?.preferred_num_bedrooms ?? undefined,
            p_budget: preferences?.budget ?? undefined,
            p_preferred_property_types: preferences.preferred_property_types ?? undefined,
            page: page,
            page_size: page_size
        });
    if (error) {
        throw error;
    }
    const total_count = data?.[0]?.total_count ?? 0;
    const properties = data?.map(({ total_count, ...property }) => property) ?? [];

    return { data: properties, count: total_count };
}

/**
 * Fetch properties for a given search results page without using user preferences for ranking 
 * @param page page number to fetch properties for - default is 1
 * @param page_size size of the page to fetch - default is 10
 * @returns Promise resolving to an object containing the properties and total count of properties matching the search criteria, or null on error
 */
async function fetchRankedPropertiesWithoutPreferences(page: number, page_size: number) {
    const supabase = await createClient();
    const { data, error, count } = await supabase
        .from("properties")
        .select("*", { count: "exact" })
        .or(`status.eq."under offer",status.eq."active"`)
        .range((page - 1) * page_size, page * page_size - 1);
    if (error) {
        throw error;
    }
    return { data, count };
}
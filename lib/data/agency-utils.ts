import { createClient } from "../supabase/client";

/**
 * Load all agencies from the database
 * @returns A list of all agencies with their id and name
 */
export async function loadAllAgencies() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("estate_agencies")
        .select("id, name");

    if (error) { throw error }

    return data;
}

/**
 * Load agency locations for a given agency id
 * @param agencyId Id of the agency to load locations for
 * @returns The id and city of all locations for the given agency id
 */
export async function loadAgencyLocations(agencyId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("estate_agency_location")
        .select("location_id, city")
        .eq("estate_agency_id", agencyId);

    if (error) {
        throw error
    }

    return data;
}

/**
 * Load agents for a given location id
 * @param locationId Id of the location to load agents for
 * @returns The id and name of all agents for the given location id
 */
export async function loadAgentsByLocation(locationId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .rpc("fetch_agents_by_location_id", { p_agency_id: locationId });

    if (error) {
        throw error;
    }
    return data;
}
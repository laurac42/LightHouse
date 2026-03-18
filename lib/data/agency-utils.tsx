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
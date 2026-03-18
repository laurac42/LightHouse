import { createClient } from "../supabase/client";

export async function loadAllAgencies() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("estate_agencies")
        .select("id, name");

    if (error) { throw error }

    return data;
}

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
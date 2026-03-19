import { createClient } from "../supabase/client";
import { AddableProperty } from "@/types/property";

export async function addProperty(propertyData: AddableProperty, agentId: string) {
    const supabase = await createClient();

    const { data: agencyData, error: agencyError } = await supabase
        .from("estate_agent_profiles")
        .select("estate_agency_location_id")
        .eq("id", agentId)
        .single();
    
    console.log(agencyData, agencyError)

    if (agencyError) {
        throw agencyError;
    }

    const { error } = await supabase
        .from("properties")
        .insert({ ...propertyData, agent_id: agentId, agency_location_id: agencyData?.estate_agency_location_id });

    if (error) {
        throw error;
    }
}


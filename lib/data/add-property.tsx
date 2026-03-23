import { createClient } from "../supabase/client";
import { AddableProperty } from "@/types/property";
import { uploadImageToStorage } from "./images";
import { StagedFiles } from "@/components/edit-images";

/**
 * Add a property to the database with the given details and agent ID
 * @param propertyData Property data to add
 * @param agentId Id of the agent who is adding the property
 * @param stagedImages Images to be staged for the property
 * @param imagesMarkedForDeletion Images to be deleted from the property
 * @param sellerId Id of the seller associated with the property
 */
export async function addProperty(propertyData: AddableProperty, agentId: string, stagedImages: StagedFiles | undefined, sellerId: string | null) {
    const supabase = await createClient();

    // get agent's agency location id to add to the property
    const { data: agencyData, error: agencyError } = await supabase
        .from("estate_agent_profiles")
        .select("estate_agency_location_id")
        .eq("id", agentId)
        .single();

    if (agencyError) {
        throw agencyError;
    }

    const { data, error } = await supabase
        .from("properties")
        .insert({ ...propertyData, agent_id: agentId, agency_location_id: agencyData?.estate_agency_location_id, seller_id: sellerId })
        .select("id");

    if (error) {
        throw error;
    }

    // add images to storage and database
    const propertyId = data?.[0].id;
    if (!propertyId) {
        throw new Error("Failed to retrieve property ID after insertion.");
    }
    if (stagedImages) {
        for (const [category, files] of Object.entries(stagedImages)) {
            let nextIndex = 0;
            for (const file of files) {
                nextIndex++;
                const path = `${category}_${nextIndex}`;
                await uploadImageToStorage(propertyId, file, path)
            }
        }

    }

}
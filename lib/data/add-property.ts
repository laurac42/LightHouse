import { createClient } from "../supabase/client";
import { AddableProperty } from "@/types/property";
import { uploadImageToStorage } from "./images";
import { StagedFiles } from "@/components/edit-images";
import { getLatitudeLongitudeFromPostcode } from "@/lib/data/location";

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

    const coordinates = await getLatitudeLongitudeFromPostcode(propertyData.post_code);
    if (!coordinates) {
        throw new Error("Failed to get coordinates for postcode. Please check the postcode.");
    }

    const { data, error } = await supabase
        .from("properties")
        .insert({ ...propertyData, agent_id: agentId, agency_location_id: agencyData?.estate_agency_location_id, seller_id: sellerId, latitude: coordinates?.latitude, longitude: coordinates?.longitude })
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
        await addImageUrlToProperty(propertyId);
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

/**
 * Add image URL to a property with the given ID
 * @param propertyId Id of the property to add image URL to
 */
export async function addImageUrlToProperty(propertyId: number) {
    const supabase = await createClient();
    const { error: imageError } = await supabase
        .from("properties")
        .update({
            image_url: `https://bqexongxbltlujcyawrj.supabase.co/storage/v1/object/public/lighthouse-bucket/properties/${propertyId}`,
        })
        .eq("id", propertyId)
        .single();
    if (imageError) {
        throw imageError;
    }
}
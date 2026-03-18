import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

type Property = Database["public"]["Tables"]["properties"]["Row"];

/**
 * Update the details of a property in the database with new values
 * @param propertyId ID of the property to update
 * @param updatedData Object containing the updated property details (only the fields that need to be updated)
 */
export async function editProperty(propertyId: number, updatedData: Partial<Property>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("properties")
        .update(updatedData)
        .eq("id", propertyId)
        .select("*")
        .single();
    if (error) {
        throw error;
    }
}

/**
 * Update a property's status
 * @param propertyId Id of the property to update the status of
 * @param newStatus New status to set for the property
 */
export async function editStatus(propertyId: number, newStatus: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId);
        
    if (error) {
        throw error;
    }
}


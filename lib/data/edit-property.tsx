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
    console.log("editing property: ", propertyId);
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


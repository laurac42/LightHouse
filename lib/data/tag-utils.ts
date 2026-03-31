import type {Tag, TagCount} from "@/types/tags";
import { createClient } from "@/lib/supabase/client";

/** 
 * Fetch all available tag options from the database (all standard tags, where seed is true)
 * @returns A list of all tags, including the tag name and id
 */
export async function fetchAllTags() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("is_seed", true);
        if (error) {
            throw error;
        }
    return data as Tag[];
}

/**
* Fetch property tags for a given property ID
* @param propertyId ID of the property to fetch tags for
* @returns A list of tags for the property, including the tag name and count of how many times the tag has been applied to properties in the database
*/
export async function fetchPropertyTags(propertyId: number) {
    const supabase = createClient();
    const { data, error } = await supabase
        .rpc("get_tag_counts", { p_property_id: propertyId });
    if (error) {
        throw error;
    }
    console.log("data from get_tag_counts RPC: ", data);
    return data as TagCount[];

}
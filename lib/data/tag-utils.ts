import type { Tag, TagCount } from "@/types/tags";
import { createClient } from "@/lib/supabase/client";


const CATEGORY_ORDER = ["Parking", "Garden", "Property Features", "Location"] as const;
type Category = (typeof CATEGORY_ORDER)[number];

/** 
 * Fetch all available standard tag options from the database (all standard tags, where seed is true)
 * @returns A list of all tags, including the tag name and id
 */
export async function fetchAllSeedTags() {
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
 * Fetch all available tag options from the database (all tags, including those added by users))
 * @returns A list of all tags, including the tag name and id
 */
export async function fetchAllTags() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("tags")
        .select("*");
    if (error) {
        throw error;
    }
    return data as Tag[];
}

/**
* Fetch property tags for a given property ID
* @param propertyId ID of the property to fetch tags for
* @param userId (optional) ID of the user to check if they have applied each tag - if not provided, user_has_applied will be false for all tags
* @returns A list of tags for the property, including the tag name and count of how many times the tag has been applied to properties in the database
*/
export async function fetchPropertyTags(propertyId: number, userId: string | undefined = undefined) {
    const supabase = createClient();
    const { data, error } = await supabase
        .rpc("get_tag_counts", { p_property_id: propertyId, p_user_id: userId });
    if (error) {
        throw error;
    }
    return data as TagCount[];

}

/**
 * Group a list of tags into the categories of Parking, Garden, Property Features and Location based on keywords in the tag name. The categories are defined as follows:
 * @param tags The list of tags to group, which must include a name property
 * @returns An object with the tags grouped by category
 */
export function groupTagsByCategory<T extends { name: string }>(tags: T[]) {
    const grouped = {
        Parking: [] as T[],
        Garden: [] as T[],
        "Property Features": [] as T[],
        Location: [] as T[],
    };

    for (const tag of tags) {
        grouped[getTagCategory(tag.name) as Category].push(tag);
    }

    return grouped;
}

/**
 * Get the category for a tag based on its name
 * @param name Name of the tag to categorise
 * @returns Category of the tag - either "Parking", "Garden", "Property Features" or "Location". If the tag name does not match any of the keywords for these categories, it will be categorised as "Property Features" by default
 */
function getTagCategory(name: string): Category {
    const normalised = name.toLowerCase();

    if (
        normalised.includes("parking") ||
        normalised.includes("garage") ||
        normalised.includes("driveway") ||
        normalised.includes("car") ||
        normalised.includes("ev charger") ||
        normalised.includes("permit")
    ) {
        return "Parking";
    }

    if (
        normalised.includes("garden") ||
        normalised.includes("patio") ||
        normalised.includes("terrace") ||
        normalised.includes("balcony") ||
        normalised.includes("outdoor")
    ) {
        return "Garden";
    }

    if (
        normalised.includes("location") ||
        normalised.includes("station") ||
        normalised.includes("transport") ||
        normalised.includes("neighborhood") ||
        normalised.includes("commute") ||
        normalised.includes("near")
    ) {
        return "Location";
    }

    return "Property Features";
}

/**
 * Add a tag to a property by inserting a record into the property_tags table in the database with the property ID, tag ID and user ID of the user who applied the tag
 * @param propertyId Id of the property to add the tag to
 * @param tagId Id of the tag to add to the property
 * @param userId Id of the user applying the tag
 */
export async function addTagToProperty(propertyId: number, tagId: number, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("property_tags")
        .insert({ property_id: propertyId, tag_id: tagId, user_id: userId })
        .select("*")
        .single();
    if (error) {
        throw error;
    }
    return data;
}

/**
 * Remove a tag from a property by deleting the record in the property_tags table in the database with the matching property ID, tag ID and user ID
 * @param propertyId Id of the property to remove the tag from
 * @param tagId Id of the tag to remove from the property
 * @param userId Id of the user removing the tag
 */
export async function removeTagFromProperty(propertyId: number, tagId: number, userId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("property_tags")
        .delete()
        .eq("property_id", propertyId)
        .eq("tag_id", tagId)
        .eq("user_id", userId);
    if (error) {
        throw error;
    }
}

/**
 * Add a new tag to the database, and then apply it to the given property
 * @param propertyId Id of the property to add the new tag to 
 * @param name Name of the new tag to add to the database and apply to the property
 * @param userId Id of the user adding the new tag and applying it to the property
 * @returns Property tag record that was added to the property_tags table for the new tag and property, including the new tag ID and name
 */
export async function addNewTagToProperty(propertyId: number, name: string, userId: string) {
    const supabase = createClient();
    // add the new tag to the tags table and get the new tag ID
    const { data: tagData, error: tagError } = await supabase
        .from("tags")
        .insert({ name: name, is_seed: false })
        .select("*")
        .single();
    if (tagError) {
        throw tagError;
    }
    // add the new tag to the property_tags table
    const { data: propertyTagData, error: propertyTagError } = await supabase
        .from("property_tags")
        .insert({ property_id: propertyId, tag_id: tagData.id, user_id: userId })
        .select("*")
        .single();
    if (propertyTagError) {
        throw propertyTagError;
    }
    return propertyTagData;
}
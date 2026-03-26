import { config } from "dotenv";
config({ path: "../.env.local" }); // load environment variables from .env file
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updatePropertyDescription(propertyId: number, newDescription: string, features: string[]) {
    try {
        const { data, error } = await supabase
            .from("properties")
            .update({ description: newDescription, features: features })
            .eq("id", propertyId);
    }
    catch (error) {
        console.error(`Error updating description for property ID ${propertyId}:`, error);
    }
}


async function fetchAllPropertyDescriptions() {
    const { data, error } = await supabase
        .from("properties")
        .select("id, description");
    if (error) {
        throw error;
    }
    return data;
}

export function getFeaturesFromDescription(description: string | null) {
    if (!description) return [];
    // all features are in <li> tags, so extract content between all <li> tags in the description, then remove <li> tags from the extracted content
    return description.match(/<li>([^<]*)<\/li>/g)?.map(li => li.replace(/<\/?li>/g, '').trim()) || [];
}

/**
 * Remove bullet points and headings and p tags from property description for displaying on cards
 * @param description description to remove bullet points and headings from
 * @returns Description with bullet points and headings removed
 */
export function removeBulletsAndHeadings(description: string | null) {
    if (!description) return "";
    // remove p tags but not content inside them, remove h1 tags and content inside them, remove ul and li tags but not content inside them
    // if a p tag is removed, add a new line character to preserve spacing between paragraphs
    const paragraphsRemoved = description.replace(/<\/p> *?/g, '\n\n');
    const allRemoved =  paragraphsRemoved.replace(/<p> *?|<h1>[\s\S]*<\/h1>|<ul>[\s\S]*?<\/ul>|<li>[\s\S]*?<\/li>/g, '');
    return allRemoved;
}

async function main() {
    try {
        const properties = await fetchAllPropertyDescriptions();
        if (!properties) {
            console.log("No properties found.");
            return;
        }
        for (const property of properties) {
            const { id, description } = property;
            if (description) {
                const features  = getFeaturesFromDescription(description);
                console.log(`Property ID ${id} features:`, features);
                const newDescription = removeBulletsAndHeadings(description);
                console.log(`Property ID ${id} new description:`, newDescription);
                await updatePropertyDescription(id, newDescription, features);
            }
        }
    } catch (error) {
        console.error("Error fetching properties: ", error);
        return;
    }

}

main();
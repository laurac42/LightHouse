import { config } from "dotenv";
config({ path: "../.env.local" });
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";
import { GoogleGenAI } from "@google/genai";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});


const USER_IDS = [
    "0da82d33-bf6e-432b-9e6d-bbfe42e66b23",
    "3dd0a1d0-a819-44ab-84a8-29ea0e6e54ae",
    "684f07d3-ff9b-4c05-84e7-400b337b0084",
    "7aaa7b41-de29-475f-bcad-f2e8475c3f2c",
    "8ada3d36-c4cc-40be-917c-9acd2b0a5907",
];

/**
 * Fetch all Ids and descriptions of properties from the database
 * @returns A list of all properties with their id and description
 */
async function fetchAllProperties() {
    const { data, error } = await supabase
        .from("properties")
        .select("id, description");
    if (error) throw error;
    return data;
}

/**
 * Fetch all tags from the database
 * @returns a list of all tags with their id and name
 */
async function fetchAllTags() {
    const { data, error } = await supabase
        .from("tags")
        .select("id, name");
    if (error) throw error;
    return data ?? [];
}

/**
 * Query gemini to select the most relevant tags for a property based on its description. The function returns an array of tag IDs.
 * @param description Description of the property to be tagged
 * @param availableTags Available tags to choose from, each with an id and name
 * @returns List of selected tag IDs (numbers)
 */
async function selectTagsForProperty(
    description: string,
    availableTags: { id: number; name: string | null }[]
): Promise<number[]> {

    const tagList = availableTags
        .map((t) => `${t.id}: ${t.name}`)
        .join("\n");


    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: `
            You are tagging a property listing. Based on the description below, select 2-3 of the most relevant tag IDs from the list provided.

            Property description:
            """
            ${description}
            """

            Available tags (id: name):
            ${tagList}

            Respond with ONLY a JSON array of tag IDs (numbers), e.g. [1, 5, 12]. No explanation.
            `});
    if (!response.text) {
        console.warn("No text response from AI for property description:", description);
        return [];
    }
    const text = response.text.trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/```(?:json)?/g, "").trim();
    const tagIds: number[] = JSON.parse(cleaned);

    // Validate returned IDs actually exist
    const validIds = new Set(availableTags.map((t) => t.id));
    return tagIds.filter((id) => validIds.has(id)).slice(0, 3);
}

/**
 * Insert property tags into the databse
 * @param propertyId Id of the property being tagged
 * @param tagIds Ids of the tags to be associated with the property
 */
async function insertPropertyTags(
    propertyId: number,
    tagIds: number[]
): Promise<void> {
    const rows = tagIds.flatMap((tagId) =>
        USER_IDS.map((userId) => ({
            property_id: propertyId,
            tag_id: tagId,
            user_id: userId,
        }))
    );

    const { error } = await supabase.from("property_tags").insert(rows);
    if (error) throw error;
}

// Main function to orchestrate the tagging process
async function main() {
    console.log("Fetching properties and tags...");
    const [properties, tags] = await Promise.all([
        fetchAllProperties(),
        fetchAllTags(),
    ]);

    if (!properties?.length) {
        console.log("No properties found.");
        return;
    }

    console.log(`Found ${properties.length} properties and ${tags.length} tags.\n`);

    for (const property of properties) {
        if (!property.description) {
            console.log(`Skipping property ${property.id} — no description.`);
            continue;
        }

        console.log(`Processing property ${property.id}...`);

        const tagIds = await selectTagsForProperty(property.description, tags);

        if (!tagIds.length) {
            console.log(`  No tags selected for property ${property.id}.`);
            continue;
        }

        const tagNames = tagIds.map(
            (id) => tags.find((t) => t.id === id)?.name ?? id
        );
        console.log(`  Selected tags: ${tagNames.join(", ")}`);

        await insertPropertyTags(property.id, tagIds);
        console.log(`  Inserted ${tagIds.length * USER_IDS.length} rows.\n`);
    }

    console.log("Done!");
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
// !!! run script using 'node -r ts-node/register -r tsconfig-paths/register update_garden_driveway.ts'
import { config } from "dotenv";
config({ path: "../.env.local" }); // load environment variables from .env file
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fetch all property descriptions and features from the database
 * @returns A list of all properties with their id, description, and features
 */
async function fetchAllPropertyDescriptionsAndFeatures() {
    const { data, error } = await supabase
        .from("properties")
        .select("id, description, features");
    if (error) {
        throw error;
    }
    return data;
}


/**
 * Update the garden and driveway fields for a property in the database
 * @param propertyId id of the property to update
 * @param hasGarden boolean indicating whether the property has a garden or not
 * @param hasDriveway boolean indicating whether the property has a driveway or not
 */
async function updateGardenDrivewayForProperty(propertyId: number, hasGarden: boolean, hasDriveway: boolean) {
    const { error } = await supabase
        .from("properties")
        .update({ garden: hasGarden, driveway: hasDriveway })
        .eq("id", propertyId);
    if (error) {
        throw new Error(`Failed to update property ID ${propertyId}`);
    }
}

/**
 * Uses the Gemini API to determine whether a property likely has a garden or driveway based on its description by prompting the model to return a JSON object with boolean properties "hasGarden" and "hasDriveway"
 * @param description Description to use to determine whether the property likely has a garden or driveway. This is the same description that is displayed on the property details page, which may contain bullet points and headings, so the model should be able to understand the description even if it contains formatting.
 * @returns A promise resolving to an object with boolean properties "hasGarden" and "hasDriveway"
 */
async function shouldPropertyHaveGardenOrDriveway(description: string | null, features: string[] | null) {
    if (!description) return { hasGarden: false, hasDriveway: false };
    const prompt = `Based on the following property description and features, determine if the property likely has a garden or driveway. 
        Return your answer as a JSON object with two boolean properties: "hasGarden" and "hasDriveway". 
        Description: ${description} Features: ${features?.join(", ") || "None"}`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
    });
    console.log("Gemini response: ", response.text);
    if (!response.text) {
        throw new Error("No response from Gemini API");
    }
    const text = response.text.replace(/```(json)?/g, "");
    const json = JSON.parse(text);
    console.log("Parsed Gemini response: ", json);
    return json as { hasGarden: boolean, hasDriveway: boolean };
}

/**
 * Fetch all properties and use AI to determine whether they likely have a garden or driveway based on their description, then update the garden and driveway fields for each property in the database accordingly
 */
async function gardenDrivewayUpdater() {
    try {
        const properties = await fetchAllPropertyDescriptionsAndFeatures();
        for (const property of properties) {
            const { hasGarden, hasDriveway } = await shouldPropertyHaveGardenOrDriveway(property.description, property.features);
            await updateGardenDrivewayForProperty(property.id, hasGarden, hasDriveway);
        }
    } catch (error) {
        console.error("Error updating garden and driveway fields for properties:", error);
    }

}

gardenDrivewayUpdater();
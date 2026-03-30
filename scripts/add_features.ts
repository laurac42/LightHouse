// !!! run script using 'node -r ts-node/register -r tsconfig-paths/register add_features.ts'
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
 * Fetch all property data from the database
 * @returns A list of all properties with their id, description, and features
 */
async function fetchAllProperties() {
    const { data, error } = await supabase
        .from("properties")
        .select("id, description, num_bedrooms, num_bathrooms, city, property_type, price")
        .filter("features", "eq", "{}"); // only fetch properties where features is []
    if (error) {
        throw error;
    }
    return data;
}

async function generateFeaturesForProperty(description: string, num_bedrooms: number | null, num_bathrooms: number | null, city: string, property_type: string | null, price: number) {
    const prompt = `Based on the following property description: "${description}", generate a list of key features of this property.
    There must be at least 5 features but more is ok.
    The property has "${num_bedrooms} bedrooms", "${num_bathrooms} bathrooms", and is located in "${city}".
    The property is "${property_type}" and has a price of "${price}".
    the features should be concise and informative, highlighting the most attractive aspects of the property.
    Return your answer as a JSON array of strings, where each string is a key feature of the property. For example: ["3 bedrooms", "2 bathrooms", "spacious garden", "modern kitchen"]`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
    });
    if (response.text) {
        // remove backticks and backticks json
        const text = response.text.replace(/```(json)?/g, "");

        // parse JSON
        const features = JSON.parse(text);
        return features;
    } else {
        throw new Error("No response from AI");
    }
}

async function updatePropertyFeatures(propertyId: number, features: string[]) {
    const { data, error } = await supabase
        .from("properties")
        .update({ features })
        .eq("id", propertyId);
    if (error) {
        throw error;
    }
    return data;
}


async function main() {
    try {
        const properties = await fetchAllProperties();

        for (const property of properties) {
            const features = await generateFeaturesForProperty(
                property.description,
                property.num_bedrooms,
                property.num_bathrooms,
                property.city,
                property.property_type,
                property.price
            );
            console.log(`Generated features for property ${property.id}:`, features);

            await updatePropertyFeatures(property.id, features);
        }
    } catch (error) {
        console.error("Error fetching properties:", error);
    }

}

main();
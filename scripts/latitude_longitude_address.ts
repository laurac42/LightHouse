// !!! run script using 'node -r ts-node/register -r tsconfig-paths/register latitude_longitude_address.ts'
import { config } from "dotenv";
config({ path: "../.env.local" }); // load environment variables from .env file
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";
import { GoogleGenAI } from "@google/genai";
import type { AddressLatandLong } from "../types/address.ts";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");

const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};


/**
 * Use postcodes.io API to get latitude and longitude from a postcode
 * @param postcode postcode to get latitude and longitude from
 * @returns An object containing the latitude and longitude of the postcode
 */
export function getLatitudeLongitudeFromAddress(postcode: string) {
    const encodedPostcode = encodeURIComponent(postcode);
    return fetch(`https://api.postcodes.io/postcodes/${encodedPostcode}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            return { latitude: result.result.latitude, longitude: result.result.longitude } as { latitude: number, longitude: number };
        })
        .catch((error) => {
            console.error(error);
            return null;
        });
}

/**
 * Get the postcodes of all properties in the database that have a null latitude and longitude
 * @returns A list of all properties with their id, address and postcode that have a null latitude and longitude
 */
async function getAllPropertyPostcodes() {
    const { data, error } = await supabase
        .from("properties")
        .select("id, address_line_1, address_line_2, city, post_code, latitude, longitude")
        .is("latitude", null);
    if (error) {
        throw error;
    }
    console.log("Properties with null latitude: ", data.length);
    return data;
}

/**
 * Regenerate postcode for a property that had an invalid postcode using Gemini AI
 * @param property Property to regenerate postcode for
 * @returns The regenerated postcode
 */
export async function regeneratePostcode(property: AddressLatandLong) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: `The address of the property is ${property.address_line_1}, ${property.address_line_2}, ${property.city}, ${property.post_code}. The postcode is incorrect, please regenerate the postcode based on the address and return only the new postcode without any additional text.
        The postcode must be a currently valid UK postcode and must not be terminated.
        The postcode must match the given city`,
    });
    return response.text?.trim();
}

/**
 * Update the latitude and longitude of a property in the database
 * @param propertyId id of the property to update the coordinates for
 * @param latitude new latitude to update the property with
 * @param longitude new longitude to update the property with
 */
async function updatePropertyCoordinates(propertyId: number, latitude: number, longitude: number) {
    console.log(`Updating property with ID ${propertyId} with latitude ${latitude} and longitude ${longitude}.`);
    const { error } = await supabase
        .from("properties")
        .update({ latitude: latitude, longitude: longitude })
        .eq("id", propertyId);
    if (error) {
        console.error(`Error updating property with ID ${propertyId}: `, error);
    }
}

/**
 * Process a property to get its latitude and longitude from its postcode, and update the property in the database with the new coordinates. If the postcode is invalid, try regenerating the postcode using Gemini AI and trying again, up to 5 attempts.
 * @param property property to process, containing its id, address and postcode
 * @returns used to return early if the property has no postcode or if the coordinates could not be obtained after 5 attempts, otherwise returns void
 */
async function processPropertyCoordinates(property: AddressLatandLong) {
    if (!property.post_code) {
        console.log(`Property with ID ${property.id} has no postcode.`);
        return;
    }
    let result = await getLatitudeLongitudeFromAddress(property.post_code);
    let numAttempts = 0;
    while (!result && numAttempts < 5) {
        console.log(`Failed to get coordinates for property with ID ${property.id}.`);
        // regenerate postcode and try again
        const regeneratedPostcode = await regeneratePostcode(property);
        console.log(`Regenerated postcode for property with ID ${property.id}: ${regeneratedPostcode}`);
        if (!regeneratedPostcode) {
            numAttempts++;
            continue;
        }
        const newResult = await getLatitudeLongitudeFromAddress(regeneratedPostcode);
        if (!newResult) {
            numAttempts++;
            continue;
        }
        result = newResult;
        numAttempts++;
    }
    if (!result) {
        console.log(`Failed to get coordinates for property with ID ${property.id} after ${numAttempts} attempts. Skipping...`);
        return;
    }
    const { latitude, longitude } = result;
    await updatePropertyCoordinates(property.id, latitude, longitude);
}

async function main() {
    try {
        const properties = await getAllPropertyPostcodes();
        if (!properties) {
            return;
        }
        for (const property of properties) {
            await processPropertyCoordinates(property);
        }
    } catch (error) {
        console.error("Error updating property coordinates: ", error);
    }
}

main();
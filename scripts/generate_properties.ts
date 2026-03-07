import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
config({ path: "../.env.local" }); // load environment variables from .env file
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";

interface Property {
    title: string;
    price: number;
    description: string;
    date_added: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    post_code: string;
    num_bedrooms: number;
    num_bathrooms: number;
    property_type: string;
    square_feet: number;
    council_tax_band: string;
    epc_rating: string;
    price_type: string;
    has_garage: boolean;
    is_new_build: boolean;
}

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

const propertyRooms = () => {
    const rooms = [
        `exterior`,
        `bathroom`,
        `kitchen`,
        `living room`,
        `bedroom`,
        `garden`,];
    return rooms;
};


/**
 * Generates a property listing using the Google Gemini API.
 * Gemini returns a property in JSON format, which is then parsed and returned as a Property object.
 * @returns a Promise that resolves to a Property object, or null if there was an error generating the property listing 
 */
async function generatePropertyListing(): Promise<Property | null> {
    try {
        // generate some random values first to ensure variety in the generated properties
        const numBedrooms = Math.floor(Math.random() * 6) + 1; // random number between 1 and 6
        const propertyTypes = ["flat", "bungalow", "villa", "detached", "semi-detached", "terraced"];
        const randomPropertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
        const isNewBuild = Math.random() < 0.3; // 30% chance of being a new build

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Generate me a property listing in JSON format. 
            The property must have ${numBedrooms} bedrooms and be a ${randomPropertyType} and ${isNewBuild ? "a new build" : "an existing property"}.
            Then select the following fields (these must be realistic for the given property type and number of bedrooms):            
            - num_bathrooms: a number between 1 and 4
            - council_tax_band: a valid band (A-H) based on the price and features of the property
            - epc_rating: a valid rating (A-G) based on the features of the property. Remember that new builds are more likely to have higher EPC ratings.
            - square_feet: a realistic square footage for the number of bedrooms and bathrooms
            - is_new_build: a boolean indicating whether the property is a new build
    Then based on rhis, generate a detailed description of the property, including details about the interior and exterior, and any unique features of the property. The description should be consistent with the randomly generated features.
    Please also start the description with a set of bullet points, highlighting key features of the property such as number of bedrooms, bathrooms, and any unique features
    The property is located in Tayside or Fife, Scotland.
    The postcode must be a valid postcode in Tayside or Fife, and the address must be consistent with the postcode. 
    The date_added should be a random date within the last 6 months (this means only dates from October 2025 onwards). 
    The price should be a realistic price for a property in Tayside or Fife with the given features. 
    The title should include the address, number of bedrooms, and property type. 
    En-suites and WCs are also counted as bathrooms, and should be included in the num_bathrooms field.
    The JSON must include the following fields: title, price, description, date_added, address_line_1, address_line_2 (optional), city, post_code, num_bedrooms, num_bathrooms, property_type, square_feet, council_tax_band, epc_rating, price_type (e.g. offers over, fixed price), has_garage (boolean), is_new_build (boolean).`,
        });
        if (response.text) {
            // remove backticks and backticks json
            const text = response.text.replace(/```(json)?/g, "");
            const property: Property = JSON.parse(text);
            return property;
        } else {
            throw new Error("No response from AI");
        }
    } catch (error) {
        console.error("Error generating property listing: ", error);
        return null;
    }

}

/**
 * Generates property images based on a description and property ID.
 * The function generates multiple images for different rooms and features of the property based on the description, and uploads them to Supabase storage.
 * @param description the description of the property
 * @param propertyId the ID of the property
 */
async function generatePropertyImage(description: string, propertyId: number) {
    try {
        const rooms = propertyRooms();
        for (const [index, room] of rooms.entries()) {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: `Generate me a realistic image of the ${room} of a house based on the following description: ${description}`,
            });

            const imageData = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
            if (!imageData) {
                throw new Error("Image data is undefined");
            }
            const buffer = Buffer.from(imageData, "base64");
            await uploadImagesToSuapbase(propertyId, buffer, room);
        }
    }
    catch (error) {
        console.error("Error generating property image: ", error);
    }
}

/**a
 * Uploads generated property image to supabase storage
 * The images are stored in a folder named after the property ID, and the filename is the index of the image
 * @param propertyId Id of the property to upload
 * @param buffer Buffer containing the image data
 * @param index Index of the image, used to name the file in storage
 */
async function uploadImagesToSuapbase(propertyId: number, buffer: Buffer, room: string) {
    // upload to supabase storage
    const { error } = await supabase.storage
        .from("lighthouse-bucket")
        .upload(`properties/${propertyId}/${room}.png`, buffer, {
            contentType: "image/png",
        });
    if (error) {
        throw error;
    }
}

/**
 * Upload a property listing to the Supabase database. 
 * The function takes a Property object and an optional list of agency locations, and inserts the property into the "properties" table in the database. 
 * A random agency location ID is assigned to the property from the list of agency locations.
 * @param property Property object containing the details of the property listing to be uploaded to the database
 * @param agencyLocations List of agency locations from the database, used to assign a random agency location to the property listing. If not provided, no agency location will be assigned.
 * @returns The ID of the inserted property listing in the database, or undefined if there was an error uploading the property listing
 */
async function uploadPropertyToSupabase(property: Property, agencyLocations: { location_id: string }[] = []): Promise<number | null> {
    try {
        const randomAgencyLocationId = returnRandomAgenctLocationId(agencyLocations);

        const { data, error } = await supabase.from("properties").insert({
            title: property.title,
            price: property.price,
            description: property.description,
            added_at: property.date_added,
            address_line_1: property.address_line_1,
            address_line_2: property.address_line_2,
            city: property.city,
            post_code: property.post_code,
            num_bedrooms: property.num_bedrooms,
            num_bathrooms: property.num_bathrooms,
            property_type: property.property_type,
            square_feet: property.square_feet,
            council_tax_band: property.council_tax_band,
            epc_rating: property.epc_rating,
            price_type: property.price_type,
            has_garage: property.has_garage,
            agency_location_id: randomAgencyLocationId,
            is_new_build: property.is_new_build,
        }).select("id").single();

        if (error) {
            throw error;
        }
        if (data) {
            return data.id; // return the id of the inserted property
        } else {
            throw new Error("No data returned from Supabase after inserting property");
        }
    } catch (error) {
        console.error("Error uploading property to Supabase: ", error);
        return null;
    }
}

/**
 * Returns a random agency location ID from the list of agency locations. This is used to assign a random agency location to each generated property listing.
 * @param agencyLocations the list of agency locations from the database
 * @returns the location ID of a random agency location
 */
function returnRandomAgenctLocationId(agencyLocations: { location_id: string }[]): string {
    const randomIndex = Math.floor(Math.random() * agencyLocations.length);
    return agencyLocations[randomIndex].location_id;
}

/**
 * Ge nerates a floor plan image for a property based on its description and uploads it to Supabase storage.
 * @param description Description of the property, used to generate the floor plan image.
 * @param propertyId ID of the property, used to name the file in Supabase storage and associate the floor plan with the correct property listing.  
 */
async function generateFloorPlan(description: string, propertyId: number) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: `Generate a floor plan image for a house based on the following description: ${description}
        The floor plan should be a simple 2D layout of the house, showing the arrangement of rooms and key features such as doors and windows. 
        The floor plan should be clear and easy to understand, with labels for each room. 
        The style of the floor plan should be minimalist and modern, with clean lines and a monochrome color scheme.
        The floor plan should show all floors, consistent with the description.`,
        });
        const imageData = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
        if (!imageData) {
            throw new Error("Image data is undefined");
        }
        const buffer = Buffer.from(imageData, "base64");
        await uploadFloorPlanToSupabase(propertyId, buffer);
    } catch (error) {
        console.error("Error generating floor plan: ", error);
    }
}

/**
 * Uploads the generated floor plan image to Supabase storage. The image is stored in a folder named after the property ID, with the filename "floorplan.png".
 * @param propertyId ID of the property to upload the floor plan for, used to name the folder in Supabase storage and associate the floor plan with the correct property listing.
 * @param buffer Buffer containing the image data of the generated floor plan
 */
async function uploadFloorPlanToSupabase(propertyId: number, buffer: Buffer) {
    try {
        const { error } = await supabase.storage
            .from("lighthouse-bucket")
            .upload(`properties/${propertyId}/floorplan.png`, buffer, {
                contentType: "image/png",
            });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Error uploading floor plan to Supabase: ", error);
    }
}

/**
 * Loads all agency locations from the database.
 * @returns A promise resolving to an array of agency location ids.
 */
async function loadAllAgencyLocations(): Promise<{ location_id: string }[]> {
    try {
        const { data, error } = await supabase.from("estate_agency_location").select("location_id");
        if (error) {
            throw error;
        }
        return data || [];
    } catch (error) {
        console.error("Error loading agency locations: ", error);
        return [];
    }
}

async function generateFullPropertyListing() {
    try {
        const property = await generatePropertyListing();
        console.log("Generated property: ", property);
        const agencyLocations = await loadAllAgencyLocations();

        if (property && agencyLocations.length > 0) {
            const propertyId = await uploadPropertyToSupabase(property, agencyLocations);
            if (propertyId) {
                await generatePropertyImage(property.description, propertyId!);
                await generateFloorPlan(property.description, propertyId!);
            } else {
                throw new Error("Failed to upload property to Supabase, propertyId is null");
            }
        }
    } catch (error) {
        console.error("Error generating property listings: ", error);
    }
}

async function main() {
    const numPropertiesToGenerate = 5;
    for (let i = 0; i < numPropertiesToGenerate; i++) {
        await generateFullPropertyListing();
    }
}

main();

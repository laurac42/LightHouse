'use server';
import { GeoJSON } from "geojson";
const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
import { createClient } from "@/lib/supabase/client";
import { PersonalLocationAddress, UserLocation } from "@/types/address";

const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

const nominationHeaders = new Headers();
nominationHeaders.append("Accept", "application/json");
nominationHeaders.append("User-Agent", "Lighthouse/1.0 (contact: 2419746@dundee.ac.uk)");

const nominationRequestOptions: RequestInit = {
    method: "GET",
    headers: nominationHeaders,
    redirect: "follow"
};

/**
 * Use postcodes.io API to get latitude and longitude from a postcode
 * @param postcode postcode to get latitude and longitude from
 * @returns An object containing the latitude and longitude of the postcode
 */
export async function getLatitudeLongitudeFromPostcode(postcode: string) {
    const encodedPostcode = encodeURIComponent(postcode);
    return fetch(`https://api.postcodes.io/postcodes/${encodedPostcode}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            return { latitude: result.result.latitude, longitude: result.result.longitude } as { latitude: number, longitude: number };
        })
        .catch((error) => {
            return null;
        });
}

// Store the time of the last request to the Nominatim API to ensure that not more than one request per second is made to avoid being rate limited
let lastRequestTime = 0;

/**
 * Get the polygon and bounding box for a location using the Nominatim API, using a delay if the last request was made less than a second ago to avoid being rate limited by the API
 * This is used to determine which properties to display when a location is searched for
 * @param location location to get the polygon and bounding box for
 * @returns An object containing the GeoJSON polygon and bounding box for the location
 */
export async function getPolygonBoundingBoxForLocation(location: string) {

    // ensure that not more than one request per second is made to the Nominatim API to avoid being rate limited
    const now = Date.now();
    const elapsed = Math.max(0, now - lastRequestTime);
    if (elapsed < 1000) {
        console.log(`Delaying Nominatim API request for ${1000 - elapsed}ms to avoid rate limiting`);
        return new Promise((resolve) => {
            setTimeout(() => {
                lastRequestTime = Date.now();
                resolve(fetchPolygonBoundingBox(location));
            }, 1000 - elapsed);
        });
    }
    lastRequestTime = Date.now();
    return fetchPolygonBoundingBox(location);
}

/**
 * Fetch the polygon and bounding box for a location using the Nominatim API
 * @param location location to get the polygon for
 * @returns An object containing the GeoJSON polygon and bounding box for the location
 */
async function fetchPolygonBoundingBox(location: string) {
    const encodedLocation = encodeURIComponent(location);
    return fetch(`https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&polygon_geojson=1`, nominationRequestOptions)
        .then((response) => response.json())
        .then((result) => {
            // take first UK based geojson result which is a polygon
            // don't use postcode results, as these are not very accurate
            const ukPolygonResults = result.filter((item: any) => item.geojson.type === "Polygon" && item.display_name.toLowerCase().includes("united kingdom") && item.addresstype !== "postcode");
            const selectedResults = ukPolygonResults.length > 0 ? ukPolygonResults : result; // fall back to first result if no UK based polygon results found

            if (!selectedResults || selectedResults.length === 0) {
                return null;
            }

            return {
                geojson: ukPolygonResults.length > 0 ? selectedResults[0].geojson : null,
                minLat: Number(selectedResults[0].boundingbox[0]),
                maxLat: Number(selectedResults[0].boundingbox[1]),
                minLng: Number(selectedResults[0].boundingbox[2]),
                maxLng: Number(selectedResults[0].boundingbox[3])
            } as { geojson: GeoJSON, minLat: number, maxLat: number, minLng: number, maxLng: number };
        })
        .catch((error) => {
            console.error(error);
            return null;
        });
}

/**
 * Add a new personal location 
 * @param userId Id of the user 
 * @param location New location to add
 * @param latitude Latitude of the new location
 * @param longitude Longitide of the new location
 * @returns The new location
 */
export async function addPersonalLocation(userId: string, location: PersonalLocationAddress, latitude: number, longitude: number) {
    const supabase = createClient();
    if (!userId) {
        throw new Error("User ID is required to add a personal location");
    }
    const { data, error } = await supabase
        .from("user_locations")
        .insert({
            nickname: location.nickname,
            user_id: userId,
            address_line_1: location.address_line_1,
            address_line_2: location.address_line_2,
            city: location.city,
            post_code: location.post_code,
            travel_mode: location.travel_mode,
            latitude: latitude,
            longitude: longitude
        })
        .select()
        .single();
    if (error) {
        throw new Error(`Error adding personal location: ${error.message}`);
    }
    return data;
}


/**
 * Edit an exisiting personal location
 * @param location Location to be edited
 * @returns Returns the edited location if successful
 */
export async function editPersonalLocation(location: UserLocation) {
    const supabase = createClient();
    if (!location.user_id) {
        throw new Error("User ID is required to edit a personal location");
    }
    const { data, error } = await supabase
        .from("user_locations")
        .update({
            nickname: location.nickname,
            address_line_1: location.address_line_1,
            address_line_2: location.address_line_2,
            city: location.city,
            post_code: location.post_code,
            travel_mode: location.travel_mode,
            latitude: location.latitude,
            longitude: location.longitude
        })
        .eq("id", location.id)
        .eq("user_id", location.user_id)
        .select();
    if (error) {
        throw new Error(`Error editing personal location: ${error.message}`);
    }
    return data;
}

/**
 * Fetch the travel time between a property and a user added location using the users chosen mode of travel
 * @param lat1 
 * @param long1 
 * @param lat2 
 * @param long2 
 * @param travel_mode 
 * @returns The travel time in minutes between the property and the user location
 */
export async function fetchDistanceBetweenPropertyAndLocation(lat1: number, long1: number, lat2: number, long2: number, travel_mode: string) {
    console.log("using google api to fetch")
    const apiKey = process.env.GEMINI_API_KEY;
    const vercelUrl = process.env.VERCEL_URL;
    console.log("Vercel URL:", vercelUrl);
    console.log("Public key: " + process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(process.env.GEMINI_API_KEY)
    if (!apiKey) {
        console.error("GEMINI_API_KEY environment variable is not set");
        return;
    }
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", `${lat1},${long1}`);
    url.searchParams.set("destinations", `${lat2},${long2}`);
    url.searchParams.set("mode", travel_mode);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();
    console.log("response from google api:", data);
    return 5;
}
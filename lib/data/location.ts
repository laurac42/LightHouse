const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");

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
export function getLatitudeLongitudeFromPostcode(postcode: string) {
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

// Store the time of the last request to the Nominatim API to ensure that not more than one request per second is made to avoid being rate limited
let lastRequestTime = 0;

/**
 * Get the bounding box for a location using the Nominatim API, using a delay if the last request was made less than a second ago to avoid being rate limited by the API
 * This is used to determine which properties to display when a location is searched for
 * @param location location to get the bounding box for
 * @returns An object containing the minimum and maximum latitude and longitude of the bounding box for the location
 */
export function getBoundingBoxForLocation(location: string)  {

    // ensure that not more than one request per second is made to the Nominatim API to avoid being rate limited
    const now = Date.now();
    console.log("last request time: ", lastRequestTime);
    const elapsed = Math.max(0, now - lastRequestTime);
    if (elapsed < 1000) {
        return new Promise((resolve) => {
            setTimeout(() => {
                lastRequestTime = Date.now();
                resolve(fetchBoundingBox(location));
            }, 1000 - elapsed);
        });
    }
    lastRequestTime = Date.now();
    return fetchBoundingBox(location);
}

/**
 * Fetch the bounding box for a location using the Nominatim API
 * @param location locaction to get the bounding box for
 * @returns An object containing the minimum and maximum latitude and longitude of the bounding box for the location
 */
function fetchBoundingBox(location: string) {
    const encodedLocation = encodeURIComponent(location);
    return fetch(`https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&polygon_geojson=1`, nominationRequestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            return { minLat: result[0].boundingbox[0], maxLat: result[0].boundingbox[1], minLng: result[0].boundingbox[2], maxLng: result[0].boundingbox[3] } as { minLat: number, maxLat: number, minLng: number, maxLng: number };
        })
        .catch((error) => {
            console.error(error);
            return null;
        });
}
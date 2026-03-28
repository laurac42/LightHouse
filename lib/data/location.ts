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

/**
 * Extracts the address, city and postcode from a given address string.
 * @param address address to extract details from
 * @return object containing addressLine1, addressLine2, city and postcode
 */
export function getAgentAddress(address: string) {
    var postcode: string | null = "";
    var city = "";
    var addressLine1 = "";
    var addressLine2 = "";

    // commas are inconsistent in the addresses, so remove them
    address = address.replace(/,/g, " ").replace(/\s+/g, " ").trim();

    const postcodeRegex = /([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})/i; // regex to match UK postcodes
    const postcodeMatch = address.match(postcodeRegex);
    postcode = postcodeMatch ? postcodeMatch[1] : null;

    const addressWithoutPostcode = postcode ? address.replace(postcode, "").trim() : address;

    // last word of address is now the city
    city = addressWithoutPostcode.split(" ").slice(-1)[0];
    const addressWithoutCity = addressWithoutPostcode.replace(city, "").trim();

    // the remaining part of the address is the street address
    // if there is a number and it is not at the start of the address, split into 2 lines
    const numGroups = addressWithoutCity.match(/(\d+)/g);

    if (numGroups && numGroups.length > 0) {

        for (const num of numGroups) {
            const numIndex = addressWithoutCity.indexOf(num);
            if (numIndex > 0) {
                const al1 = addressWithoutCity.substring(0, numIndex).trim();
                const al2 = addressWithoutCity.substring(numIndex).trim();
                addressLine1 = al1;
                addressLine2 = al2;
                break;
            } else {
                addressLine1 = addressWithoutCity;
            }
        }
    }

    return {
        addressLine1,
        addressLine2,
        city,
        postcode
    };
}
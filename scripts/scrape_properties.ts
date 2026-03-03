// !!! run script using 'node -r ts-node/register -r tsconfig-paths/register scrape_properties.ts'
import * as cheerio from "cheerio";
import * as axios from "axios";

const PROPERTY_URL = "https://tspc.co.uk/properties-sitemap.xml";


/**
 * Get the URLs of all properties on the website from the sitemap
 * @returns An array of property URLs, or null if there was an error fetching the URLs
 */
async function getPropertyURLs() {
    try {
        const response = await axios.default.get(PROPERTY_URL)
        const xml = response.data;
        const $ = cheerio.load(xml, { xmlMode: true }); // sitemap is in XML format, so enable xmlMode
        const urls = $("url loc").map((i, el) => $(el).text()).get();
        return urls;
    } catch (error) {
        console.error("Error fetching property URLs:", error);
        return null;
    }
}

async function scrapeProperties() {
    try {
        const propertyURLs = await getPropertyURLs();
        if (propertyURLs) {
            for (const url of propertyURLs) {
                console.log("Property URL: ", url);
                scrapreSpecificProperty(url);
            }
        } else {
            console.log("No property URLs found.");
        }
    } catch (error) {
        console.error("Error scraping properties:", error);
    }
}

async function scrapreSpecificProperty(url: string) {
    try {
        const response = await axios.default.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const title = $("title").text().trim();
        console.log(`Title of property at ${url}: ${title}`);

    } catch (error) {        
        console.error(`Error scraping property at ${url}:`, error);
    }
}

scrapreSpecificProperty('https://tspc.co.uk/property/5-Bed-Detached-Villa-For-Sale-Westhaven-House-West-Haven-Road-Carnoustie-DD7-6JS/');


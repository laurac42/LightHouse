// !!! run script using 'node -r ts-node/register -r tsconfig-paths/register scrape_agents.ts'
import * as cheerio from "cheerio";
import * as axios from "axios";
import {config} from "dotenv";
config({path: "../.env.local"}); // load environment variables from .env file
import { createClient } from "@supabase/supabase-js";
import { getAgentAddress } from "./address_format.ts";

// create client with service role key to allow uploading to storage from a non-server environment
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const TSPC_URL = "https://tspc.co.uk/solicitors/";

/**
 * Scrape the TSPC website to get a list of estate agents, then scrape each agent's page to get their address and phone number.
 */
async function scrapeEstateAgents() {
    try {
        const html = await axios.default.get(TSPC_URL).then(response => response.data);
        // parse the HTML using cheerio
        const $ = cheerio.load(html);
        const $solicitors = $(".solicitor-item");
        const $solicitorNames = $solicitors.find(".content-wrapper .title-wrapper h3");
        const $solicitorImageURLS = $solicitors.find(".image-wrapper img").map((i, el) => $(el).attr("data-src")).get();

        const solicitorData = $solicitorNames.map((index, el) => ({
            name: $(el).text().trim(),
            imageUrl: $solicitorImageURLS[index]
        })).get();

        // upload solicitor data to supabase
        const { data, error } = await supabase.from("estate_agencies").insert(solicitorData.map(agent => ({
            name: agent.name,
            logo_url: agent.imageUrl
        }))).select("id, name");

        // match the agency name to ID, so they can be linked to the locations when those are uploaded
        const agencyMap = new Map<string, number>();
        data?.forEach((agency: any) => {
            agencyMap.set(agency.name, agency.id);
        });

        if (error) {
            throw error;
        }

        for (const element of $solicitorImageURLS) {
            console.log("Image url: " , element);
            downloadAgentLogo("https://tspc.co.uk" + element);
        }
        
        for (const element of $solicitorNames) {
            const regex = /[^a-z0-9-]+/gi; // groups all characters that are not letters, numbers or hyphens
            const trimmedName = $(element).text().trim().toLowerCase().replace(regex, "-").replace(/^\-+|\-+$/g, ""); // replace groups with hyphen and convert to lowercase, then remove leading/trailing hyphens

            console.log(`Scraping agent: ${trimmedName}`);
            await scrapeSpecificAgent(trimmedName, agencyMap.get($(element).text().trim())!);

        }
    } catch (error) {
        console.error("Error scraping estate agents:", error);
    }
}

/**
 * Scrape details of a specific agent given their name (as it appears in the URL)
 * Returns the address and phone number
 * @param agentName The name of the agent to scrape
 * @param agencyId the ID of the agency in the database, to link the location to when uploading
 */
async function scrapeSpecificAgent(agentName: string, agencyId: number) {
    try {
        const agentUrl = TSPC_URL + '/' + agentName;

        const agentResponse = await fetch(agentUrl);
        const agentHtml = await agentResponse.text();
        const $agentPage = cheerio.load(agentHtml);

        const locations = $agentPage(".location-item").get();
        for (const location of locations) {
            const $location = $agentPage(location);
            const $infoItems = $location.find(".info-item");

            // email is cloudflare protected, so add emails manually and ignore here
            const address = $infoItems.eq(0).text().trim();
            const { addressLine1, addressLine2, city, postcode } = getAgentAddress(address);
            const phone = $infoItems.eq(1).text().trim();
            
            // upload each location to the estate_agency_location table, linking to the agent in the estate_agents table
            const { error } = await supabase.from("estate_agency_location").insert({
                address_line_1: addressLine1,
                address_line_2: addressLine2,
                city: city,
                post_code: postcode,
                phone_number: phone,
                estate_agency_id: agencyId
            });
            if (error) {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error scraping specific agent:", error);
    }
}

/**
 * Downloads an agent logo from a given URL and uploads it to Supabase storage
 * @param imageUrl the URL of the image 
 */
async function downloadAgentLogo(imageUrl: string) {
    try {
        const response = await axios.default.get(imageUrl, { responseType: "arraybuffer" });
        const imageData = response.data;
        const fileName = imageUrl.split("/").pop();

        // upload to Supabase storage
        const { error } = await supabase.storage.from("lighthouse-bucket").upload(`logos/${fileName}`, imageData, {
            contentType: "image/webp"
        });
        if (error) {    
            throw error;
        }
    } catch (error) {
        console.error("Error downloading agent logo:", error);
    }
}

scrapeEstateAgents();
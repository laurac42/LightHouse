//  node -r ts-node/register -r tsconfig-paths/register update_property_details.ts
import { config } from "dotenv";
config({ path: "../.env.local" }); // load environment variables from .env file
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


async function setImageUrls(propertyId: number) {
    try {

        const { data, error } = await supabase
            .from("properties")
            .update({
                image_url: `https://bqexongxbltlujcyawrj.supabase.co/storage/v1/object/public/lighthouse-bucket/properties/${propertyId}`,
                floorplan_url: `https://bqexongxbltlujcyawrj.supabase.co/storage/v1/object/public/lighthouse-bucket/properties/${propertyId}/floor-plan.png`
            })
            .eq("id", propertyId)
            .single();
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error(`Error updating property with id ${propertyId}: `, error);
    }
}


    async function getAllIncompleteProperties() {
        try {
            const { data, error } = await supabase
                .from("properties")
                .select("id")
                .is("image_url", null);
            if (error) {
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error("Error fetching properties: ", error);
            return [];
        }

    }

    async function main() {
        const properties = await getAllIncompleteProperties();
        for (const property of properties) {
            console.log(`Updating property with id ${property.id}...`);
            await setImageUrls(property.id);
        }
    }

    main();
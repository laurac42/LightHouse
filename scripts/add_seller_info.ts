import { config } from "dotenv";
config({ path: "../.env.local" });
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DESCRIPTIONS = [
  "A quiet, tree-lined street with great neighbours. We've made wonderful memories here over the years.",
  "Fantastic location — walking distance to schools, shops, and the park. The community feel is second to none.",
  "Bright and airy throughout the day. The back garden gets sun from morning until evening.",
  "The kitchen was fully renovated two years ago and the whole house has been lovingly maintained.",
  "We've enjoyed every moment here. The area has excellent transport links and a real village feel.",
  "A charming period property with original features throughout. The loft conversion adds fantastic extra space.",
  "South-facing garden and a converted garage that works perfectly as a home office or studio.",
  "Quiet cul-de-sac, ideal for families. Ofsted Outstanding schools within walking distance.",
  "Modern open-plan living with underfloor heating downstairs. Very low maintenance inside and out.",
  "The conservatory is a real highlight — we use it year-round. Great storage throughout the house.",
  "Steps from the high street but surprisingly peaceful once you're inside. Double glazing keeps it very quiet.",
  "We installed solar panels three years ago — energy bills are minimal. A really efficient home to run.",
];

const REASONS = [
  "Downsizing and moving to be nearer family",
  "Moving for work",
  "Moving to the countryside",
  "Upsizing for a growing family",
  "Relocating abroad",
  "Moving to a new city for a fresh start",
  "Retiring and moving to the coast",
  "Purchasing a property together with a partner",
  "Moving closer to elderly parents",
  "Career change requiring relocation",
];

/**
 * Select a random element from an array
 * @param arr an array of any type
 * @returns a random element from the array
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random seller info object with a description and reason for selling
 * @returns 
 */
function generateSeller() {
  return {
    seller_description: pick(DESCRIPTIONS),
    reason_for_selling: pick(REASONS),
  };
}

/**
 * Fetch all property data from the database
 * @returns A list of all properties with their id
 */
async function fetchAllProperties() {
    const { data, error } = await supabase
        .from("properties")
        .select("id");
    if (error) {
        throw error;
    }
    return data;
}

async function main() {
  const propertyIds = await fetchAllProperties();
  for (const { id } of propertyIds) {
    const { data, error } = await supabase
      .from("property_seller_info")
      .insert({
        id: id,
        ...generateSeller(),
      })
      .select();
    if (error) {
      console.error(`Failed to insert seller info for property ${id}:`, error.message);
    }
  }
}

main();
import { createClient } from "@/lib/supabase/client";

/**
 * Get property image URLs from Supabase storage for a given property ID
 * @param id ID of the property to get images for
 * @returns a list of image URLs for the property, or an empty list if no images are found or an error occurs
 */
export async function getImagesFromStorage(id: number) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.storage.from("lighthouse-bucket").list(`properties/${id}`);
        if (error) {
            throw error;
        }
        return data?.map((item) => item.name) || [];
    } catch (error) {
        console.error("Error fetching property images: ", error);
        return [];
    }
}
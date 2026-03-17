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

export async function uploadImageToStorage(propertyId: number, file: File, filename: string) {
    const supabase = await createClient();
    const fileType = file.type || "image/png"; // default to png if type is not available
    console.log(fileType)
    const { data, error } = await supabase.storage.from("lighthouse-bucket")
    .upload(`properties/${propertyId}/${filename}.${fileType.replace("image/", "")}`, file, {
            contentType: `${fileType}`,
        });
    
    if (error) {
        throw error;
    }
}

/**
 * Get the number of properties in a given category in supabase storage
 * @param category 
 * @param propertyId 
 */
export async function getNumberOfImagesInCategory(category: string, propertyId: number) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from("lighthouse-bucket")
        .list(`properties/${propertyId}`);
    
    if (error) {
        throw error;
    }
    var count = 0;
    for (const file in data) {
        if (data[file].name.startsWith(category)) {
           count ++;
        }
    }
    
    return count;
}
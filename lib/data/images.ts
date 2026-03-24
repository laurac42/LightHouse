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

/**
 * Upload an image to storage
 * @param propertyId Id of the property to upload the image for
 * @param file The image file to upload
 * @param filename The name to give the file in storage (without extension, category and index will be added to this)
 * @param sellerImage Whether the image is a seller image
 */
export async function uploadImageToStorage(propertyId: number, file: File, filename: string, sellerImage = false) {
    const supabase = await createClient();
    const fileType = file.type || "image/png"; // default to png if type is not available
    const path = sellerImage ? `properties/${propertyId}/seller/${filename}` : `properties/${propertyId}/${filename}`;

    const { error } = await supabase.storage.from("lighthouse-bucket")
    .upload(path, file, {
            contentType: `${fileType}`,
        });
    
    if (error) {
        throw error;
    }
}

/**
 * Delete an image from supabase storage for a given property ID and filename
 * @param propertyId Id of the property 
 * @param filename Name of the file to delete the image 
 */
export async function deleteImageFromStorage(propertyId: number, filename: string, sellerImage = false) {
    const supabase = await createClient();
    const path = sellerImage ? `properties/${propertyId}/seller/${filename}` : `properties/${propertyId}/${filename}`;
    
    console.log("Deleting image at path: ", path);  
    const { error } = await supabase.storage
        .from("lighthouse-bucket")
        .remove([path]);

    if (error) {
        throw error;
    }
}

/**
 * Get the next index of a category of images so that it can be decided what to name the next image
 * @param category Category to get index for
 * @param propertyId Id of the property to get the index for
 */
export async function getNextIndexInCategory(category: string, propertyId: number) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from("lighthouse-bucket")
        .list(`properties/${propertyId}`);
    
    if (error) {
        throw error;
    }
    var maxIndex = 0;

    // find the last index of the given category to account for image deletions)
    for (const file in data) {
        if (data[file].name.startsWith(category)) {
           let index = parseInt(data[file].name.split('_').pop() ?? '0', 10);
            if (index > maxIndex) {
                maxIndex = index;
            }
        }
    }
    
    return maxIndex;
}

export async function loadSellerImages(propertyId: number) {
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from("lighthouse-bucket")
        .list(`properties/${propertyId}/seller`);
    if (error) {
        throw error;
    }

    return data?.map((item) => item.name) || [];
}
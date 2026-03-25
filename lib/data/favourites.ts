import { createClient } from "../supabase/client";

/**
 * Save a property to the user's favourites in the database.
 * @param propertyId Id of the property to be saved as a favourite
 * @param userId Id of the user saving the favourite
 * @returns A promise resolving to the result of the database operation
 */
export async function saveFavourite(propertyId: number, userId: string) {
    const supabase = await createClient();
    
    const {  error } = await supabase
        .from('buyer_favourites')
        .insert({ property_id: propertyId, buyer_id: userId });

    if (error) {
        throw error;
    }
}

/**
 * Remove a property from the user's favourites in the database
 * @param propertyId Id of the property to be removed from favourites
 * @param userId Id of the user removing the favourite
 */
export async function removeFavourite(propertyId: number, userId: string) {
    const supabase = await createClient();  

    const { error } = await supabase
        .from('buyer_favourites')
        .delete()
        .eq('property_id', propertyId)
        .eq('buyer_id', userId);

    if (error) {
        throw error;
    }
}
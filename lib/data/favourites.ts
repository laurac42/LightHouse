import { createClient } from "../supabase/client";

/**
 * Save a property to the user's favourites in the database. If the user is not authenticated, an alert is shown prompting them to log in.
 * @param propertyId Id of the property to be saved as a favourite
 * @param userId Id of the user saving the favourite
 * @returns A promise resolving to the result of the database operation
 */
export async function saveFavourite(propertyId: number, userId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('buyer_favourites')
        .insert({ property_id: propertyId, buyer_id: userId })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}
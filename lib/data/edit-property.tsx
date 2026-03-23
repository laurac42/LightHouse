import { createClient } from "@/lib/supabase/client";
import { AddableProperty, EditableProperty, Property } from "@/types/property";


/**
 * Update the details of a property in the database with new values
 * @param propertyId ID of the property to update
 * @param updatedData Object containing the updated property details (only the fields that need to be updated)
 */
export async function editProperty(propertyId: number, updatedData: Partial<Property>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("properties")
        .update(updatedData)
        .eq("id", propertyId)
        .select("*")
        .single();
    if (error) {
        throw error;
    }
}

/**
 * Update a property's status
 * @param propertyId Id of the property to update the status of
 * @param newStatus New status to set for the property
 */
export async function editStatus(propertyId: number, newStatus: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId);

    if (error) {
        throw error;
    }
}

/**
 * Remove a feature from and editable property's features array at the specified index and update the state
 * @param index index of the feature to remove from the features array
 * @param features array of features for the property
 * @param setProperty function to update the property state
 */
export function removeFeatureEditable(index: number, features: string[], setProperty: React.Dispatch<React.SetStateAction<EditableProperty | null>>) {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setProperty((prev) => prev ? { ...prev, features: newFeatures } : null);
}

/**
 * Remove a feature from an addable property's features array at the specified index and update the state
 * @param index index of the feature to remove from the features array
 * @param features array of features for the property
 * @param setProperty function to update the property state
 */
export function removeFeatureAddable(index: number, features: string[], setProperty: React.Dispatch<React.SetStateAction<AddableProperty>>) {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setProperty((prev) => ({ ...prev, features: newFeatures }));
}

export async function updateSellerAddedInfo(propertyId: number, sellerDetails: string, reason: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("property_seller_info")
        .update({ seller_description: sellerDetails, reason_for_selling: reason })
        .eq("id", propertyId);

    if (error) {
        throw error;
    }
}
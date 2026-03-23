import { createClient } from "@/lib/supabase/client"

/**
 * Checks if the user is authenticated by attempting to fetch their details from Supabase. 
 * If the user is not authenticated, it returns null, else returns the user data.
 * @returns boolean indicating whether the user is authenticated or not
 */
export async function validateUser() {
    try {
        const supabase = await createClient();
        const { data: user, error } = await supabase.auth.getUser();
        if (error) {
            throw error;
        } else if (!user) {
            throw new Error("No user found");
        }
        return user;
    } catch (error) {
        return null;
    }
}

/**
 * Fetches the ID of a user with a given email address
 * @param email email address to fetch the corresponding user ID of
 * @returns The ID of the user
 */
export async function getIdByEmail(email: string) {
    const supabase = await createClient();
    const { data: userId, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (error || !userId) {
        throw error;
    }
    return userId;
}

/**
 * Gets the email of a user with a given ID
 * @param id Id to fetch the corresponding email of
 * @returns The email of the user
 */
export async function getEmailById(id: string) {
    const supabase = await createClient();
    const { data: userEmail, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', id)
        .maybeSingle();

    if (error || !userEmail) {
        throw error;
    }
    return userEmail;
}
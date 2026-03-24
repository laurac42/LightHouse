import { createClient } from "@/lib/supabase/client"
import type { User } from "@/types/user";

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

/**
 * Fetch a user's basic details (name and email address) 
 * @param userId Id of the user to fetch details for
 * @returns User first name, last name and email address
 */
export async function fetchUserDetails(userId: string) {
    const supabase = await createClient();
    const { data: userDetails, error } = await supabase
        .from('users')
        .select('first_name, last_name, email, user_goals')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }
    return userDetails;
}

/**
 * Update a user's details (name) by their id
 * @param user user to update details of
 */
export async function updateUserDetails(user: User) {
    const supabase = await createClient();
    console.log("user to update: ", user)
    const {error} = await supabase
    .from("users")
    .update({ first_name: user.first_name, last_name: user.last_name, user_goals: user.user_goals })
    .eq('id', user.id);

    if (error) {
        throw error;
    }
}
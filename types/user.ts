import { Database } from "./supabase";

export type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_goals: string[];
}

export type UserPreferences = Database["public"]["Tables"]["buyer_profiles"]["Row"];
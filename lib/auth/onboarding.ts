import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Checks if the user has completed onboarding and redirects accordingly.
 * @returns string indicating the user's onboarding status or "error" if there was an issue fetching the user.
 */
export async function CheckOnboarding() {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error fetching user:", error);
    return "error";
  }

  const { data: onboarding, error: onboardingError } = await supabase
    .from("users")
    .select("onboarded")
    .eq("id", user.user.id)
    .single();

  if (onboardingError) {
    console.error("Error fetching onboarding status:", onboardingError);
    return "error";
  }

  return onboarding?.onboarded ? "onboarded" : "not_onboarded";
}
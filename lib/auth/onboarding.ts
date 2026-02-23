import { createClient } from "@/lib/supabase/client"

/**
 * Checks if the user has completed onboarding and redirects accordingly.
 * @returns string indicating the user's onboarding status or "error" if there was an issue fetching the user.
 */
export async function CheckOnboarding() {
  try {
    const supabase = await createClient();
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Error fetching user:", error);
      return "error";
    }

    const { data: onboardingData, error: onboardingError } = await supabase
      .from("users")
      .select("onboarded")
      .eq("id", user.user.id)
      .maybeSingle();

    if (onboardingError) {
      console.error("Error fetching onboarding status:", onboardingError);
      return "error";
    }

    if (!onboardingData) {
      return "not_onboarded";
    }

    return onboardingData?.onboarded ? "onboarded" : "not_onboarded";

  } catch (error) {
    console.error("Unexpected error:", error);
    return "error";
  }
}
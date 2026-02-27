'use client';
import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckOnboarding } from "@/lib/auth/onboarding";
import { validateUser } from "@/lib/auth/user";

export default function PersonalDetails() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [buying, setBuying] = useState(false);
  const [selling, setSelling] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    async function verifyOnboarding() {
      const status = await CheckOnboarding();

      if (status === "error") {
        router.push("/");
      } else if (status === "onboarded") {
        router.push("/public/home");
      }
    }

    verifyOnboarding();
  }, [router]);

  /**
   * Handle the user clicking the from submit button. This will update the user's details in the database and mark them as onboarded.
   * @param e event object from the form submission
   * @returns void 
   */
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user = await validateUser();
      if (!user) {
        throw new Error("Error fetching user details. Please try again.");
      }

      const supabase = await createClient();
      const { error } = await supabase.from("users").update({
        first_name: firstName,
        last_name: lastName,
        user_goals: [buying ? "buying" : null, selling ? "selling" : null, browsing ? "browsing" : null].filter(Boolean),
        onboarded: buying ? false : true,
      }).eq("id", user.user.id).select().single();

      if (error) {
        throw new Error(error.message);
      }

      // add a buyer profile if the user is a buyer
      if (buying) {
        console.log("Adding buyer profile...");
        await addBuyerProfile(user.user.id);
        console.log("Buyer profile added successfully");
        router.push("/onboarding/buyer-profile");
      } else {
          router.push("/public/home");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error updating details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a buyer profile for a user.
   * @param userId the user ID to add the buyer profile for
   * @returns void
   */
  async function addBuyerProfile(userId: string) {
    const supabase = await createClient();
    const { error: buyerProfileError } = await supabase.from("buyer_profiles").insert({
      id: userId,
    }).select().single();

    if (buyerProfileError) {
      throw new Error(buyerProfileError.message);
    }
  }

  return (
    <div className="bg-background w-full min-h-svh">
      <Navbar />
      <div className="flex w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <Card className="bg-white/90 border-none">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Your Details
                </CardTitle>
                <CardDescription>Enter your personal details to complete your profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="First Name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border border-border"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Last Name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border border-border"
                      />
                    </div>
                    <FieldSet>
                      <FieldLegend variant="label">
                        What are you using LightHouse for?
                      </FieldLegend>
                      <FieldGroup className="gap-3">
                        <Field orientation="horizontal">
                          <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="buying-checkbox" name="buying-checkbox" checked={buying} onCheckedChange={(checked) => setBuying(checked as boolean)} />
                          <FieldLabel htmlFor="buying-checkbox" className="font-normal">
                            Buying
                          </FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                          <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="selling-checkbox" name="selling-checkbox" checked={selling} onCheckedChange={(checked) => setSelling(checked as boolean)} />
                          <FieldLabel htmlFor="selling-checkbox" className="font-normal">
                            Selling
                          </FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                          <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="browsing-checkbox" name="browsing-checkbox" checked={browsing} onCheckedChange={(checked) => setBrowsing(checked as boolean)} />
                          <FieldLabel htmlFor="browsing-checkbox" className="font-normal">
                            Just Browsing
                          </FieldLabel>
                        </Field>
                      </FieldGroup>
                    </FieldSet>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-xl" disabled={isLoading}>
                      {isLoading ? "Adding your details..." : "Complete Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

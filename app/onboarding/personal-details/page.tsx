'use client';
import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [buying, setBuying] = useState(false);
  const [selling, setSelling] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Error fetching user details. Please try again.");
      return;
    }

    const { error } = await supabase.from("users").update({
      first_name: firstName,
      last_name: lastName,
      user_goals: [buying ? "buying" : null, selling ? "selling" : null, browsing ? "browsing" : null].filter(Boolean),
      onboarded: true,
    }).eq("id", user.user.id);

    if (error) {
      setError("Error updating details. Please try again.");
      return;
    }
  };

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
                          <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="buying-checkbox" name="buying-checkbox" checked={buying} onCheckedChange={(checked) => setBuying(checked as boolean)}/>
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

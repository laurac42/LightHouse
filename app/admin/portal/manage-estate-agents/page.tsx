'use client';

import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { MailIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AdminPortalMenu from "@/components/admin-portal-menu";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth/user";
import { isAdmin } from "@/lib/auth/role";

export default function ManageEstateAgentsPage() {
  const [email, setEmail] = useState("");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    async function checkAdmin() {
      const user = await validateUser();
      if (!user) {
        router.push("/public/home");
        return;
      }
      const admin = await isAdmin();
      if (!admin) {
        router.push("/public/home");
      }
    }

    checkAdmin();
  }, [router]);
  /**
   * Function to handle adding a new estate agent.
   */
  async function addEstateAgent(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    // firstly, check if the user already has an account 
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("users")
        .select("email, id")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        await upgradeExistingUserToAgent(data.id);
      } else {
        console.log("No user with this email found, creating new estate agent...");
      }
    } catch (error) {
      console.error("Error checking for existing user:", error);
      return;
    }
  }

  async function upgradeExistingUserToAgent(id: string) {
    try {
      const supabase = await createClient();

      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      } else if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await supabase.rpc("upgrade_user_to_agent", {
        p_user_id: id,
        p_agency_id: selectedAgencyId,
        p_admin_id: user.user.id
      });
      if (error) {
        throw error;
      }
      setSuccessMessage("User successfully upgraded to estate agent.");

    } catch (error) {
      console.error("Error upgrading existing user to estate agent:", error);
      setErrorMessage("Failed to upgrade user to estate agent.");
    }
  }

  /**
   * Function to fetch the estate agencies from the database and populate the select options in the form. This will allow the admin to select which agency the new estate agent works for when adding them.
   */
  async function fetchEstateAgencies() {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("estate_agencies")
        .select("id, name");
      if (error) {
        console.error("Error fetching estate agencies:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching estate agencies:", error);
      return [];
    }
  }


  return (
    <div className="bg-background w-full min-h-svh">
      <Navbar />
      <div className="w-full p-6 md:p-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <AdminPortalMenu />
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Manage Estate Agents</CardTitle>
              <CardDescription>
                Here you can create and manage estate agent profiles. Just enter the email address, select the company and click "Add Estate Agent" to add a new estate agent to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <form onSubmit={addEstateAgent}>
                  <div className="md:grid md:grid-cols-2 md:gap-x-4">
                    <div className="flex flex-col gap-2">
                      <Field className="pb-8">
                        <FieldLabel htmlFor="estate-agent-email">Estate Agent Email</FieldLabel>
                        <InputGroup className="border border-foreground flex">
                          <InputGroupInput type="email" placeholder="agent@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                          <InputGroupAddon>
                            <MailIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription>Email address of the person you want to add as an estate agent.</FieldDescription>
                      </Field>
                    </div>
                    <div className="flex flex-col">
                      <Field>
                        <FieldLabel>Select Estate Agent Company</FieldLabel>

                        <Suspense fallback={<div>Loading companies...</div>}>
                          <Select onValueChange={(value) => setSelectedAgencyId(value)} required>
                            <SelectTrigger className="border border-foreground">
                              <SelectValue placeholder="Select Company" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {fetchEstateAgencies().then(agencies => agencies.map(agency => (
                                  <SelectItem key={agency.id} value={agency.id.toString()}>{agency.name}</SelectItem>
                                )))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Suspense>
                        <FieldDescription className="pt-0 mt-0">Select the company the estate agent works for.</FieldDescription>
                      </Field>

                      {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
                      {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
                      {/* <div className="w-3/4 flex justify-end mt-4"> */}
                      <Button type="submit" className="bg-buttonColor hover:bg-buttonHover text-foreground font-bold text-md h-10 w-1/2 mt-4 ml-auto">
                        Add Estate Agent
                      </Button>
                      {/* </div> */}
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
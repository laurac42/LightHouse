'use client';

import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth/user";
import { isEstateAgent } from "@/lib/auth/role";
import PortalMenu from "@/components/portal-menu";

type SellerItem = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
};

export default function ManageSellersPage() {
    const [email, setEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [sellers, setSellers] = useState<SellerItem[]>([]);
    const [loadingSellers, setLoadingSellers] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkEstateAgent() {
            const user = await validateUser();
            if (!user) {
                router.push("/public/home");
                return;
            }
            setUser(user);
            const estateAgent = await isEstateAgent();
            if (!estateAgent) {
                router.push("/public/home");
            }
        }

        checkEstateAgent();
        fetchSellers().then(setSellers).finally(() => setLoadingSellers(false))
    }, [router]);

    /**
     * Function to handle adding a new seller
     */
    async function addSeller(e: React.FormEvent) {
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
                const isAlreadySeller = await isUserAlreadySeller(data.id);
                if (isAlreadySeller) {
                    setErrorMessage("This user is already an .");
                    return;
                }
                await upgradeExistingUserToSeller(data.id);
            } else {
                console.log("No user with this email found, creating new seller...");
                await inviteNewSeller(email);
            }
        } catch (error) {
            console.error("Error checking for existing user:", error);
            return;
        }
    }

    /**
     * Upgrade an existing user to have seller permissions
     * This is done by calling a Postgres function which will handle all the necessary database updates in a transaction
     * @param id id of the user to upgrade their account
     */
    async function upgradeExistingUserToSeller(id: string) {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase.rpc("upgrade_user_to_seller", {
                p_user_id: id,
                p_agent_id: user.user.id
            });
            if (error) {
                throw error;
            } else {
                setSuccessMessage("User successfully upgraded to seller.");
            }

        } catch (error) {
            console.error("Error upgrading existing user to seller:", error);
            setErrorMessage("Failed to upgrade user to seller.");
        }
    }

    /**
     * Check if a user with a given id is already a seller
     * @param id id of the user to check if they are already a seller
     * @returns boolean indicating whether the user is already a seller or not
     */
    async function isUserAlreadySeller(id: string) {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("user_id", id)
                .eq("role", "seller");
            if (error) {
                throw error;
            }
            return data.length > 0;
        } catch (error) {
            console.error("Error checking if user is already a seller:", error);
            return false;
        }
    }
    /**
     * Sends an email invite to the provided email address to join the platform and create an account
     * The new account will be a selelr account
     * @param email email of the user to invite
     */
    async function inviteNewSeller(email: string) {
        try {
            const response = await fetch("/api/invite-seller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    grantedBy: user.user.id,
                }),
            });

            const data = await response.json();
            if (data.error) {
                console.error("Error inviting new seller:", data.error);
                setErrorMessage(data.error);
            } else {
                setSuccessMessage("Invitation sent to new seller.");
            }
        } catch (error) {
            console.error("Error inviting new seller:", error);
            setErrorMessage("Failed to invite new seller.");
        }
    }

    /**
     * Fetch all sellers that have been created by the current estate agent
     */
    async function fetchSellers() {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase.rpc('get_users_granted_by_agent');
            if (error) {
                throw error;
            }

            console.log("Fetched sellers:", data);
            return data;
        } catch (error) {
            console.error("Error fetching sellers:", error);
            return null;
        }
    }

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <PortalMenu role="admin" />
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Manage Sellers</CardTitle>
                            <CardDescription>
                                <p>
                                    Here you can view and add seller profiles. To add a new enter the email address, and click "Add Seller" to add a new seller to the system.
                                </p>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-xl">Your Sellers</h1>
                                    <p className="text-muted-foreground text-sm">This table displays details of sellers you have previously added</p>
                                    <table className="table-auto border border-foreground">
                                        <thead>
                                            <tr key={"header"}>
                                                <th className="border border-foreground">Seller Name</th>
                                                <th className="border border-foreground">Email Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { loadingSellers ? (
                                                <tr>
                                                    <td colSpan={2} className="text-center py-4">Loading sellers...</td>
                                                </tr>
                                            ) : sellers && sellers.length > 0 ? (
                                                sellers.map((seller) => (
                                                    <tr key={seller.id}>
                                                        <td className="border border-foreground">{seller.first_name} {" "} {seller.last_name}</td>
                                                        <td className="border border-foreground">{seller.email}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className="text-center py-4">No sellers found.</td>
                                                </tr>
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                                <form onSubmit={addSeller}>
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl">Add Seller</h1>
                                        <p className="text-muted-foreground text-sm">
                                            If the email address entered is <b>not associated with an existing user account</b>, an invitation will be sent to that email address to join the platform and create an account. If the email address is <b>already associated with an existing user account</b>, that account will be upgraded to have seller permissions.
                                        </p>
                                        <div className="md:grid md:grid-cols-2 md:gap-x-4">
                                            <div className="flex flex-col gap-2">
                                                <Field className="pb-8">
                                                    <FieldLabel htmlFor="seller-email">Seller Email</FieldLabel>
                                                    <InputGroup className="border border-foreground flex">
                                                        <InputGroupInput type="email" placeholder="seller@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                                        <InputGroupAddon>
                                                            <MailIcon />
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    <FieldDescription>Email address of the person you want to add as a seller.</FieldDescription>
                                                </Field>
                                            </div>
                                            <div className="flex flex-col">
                                                {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
                                                {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
                                                {/* <div className="w-3/4 flex justify-end mt-4"> */}
                                                <Button type="submit" className="bg-buttonColor hover:bg-buttonHover text-foreground font-bold text-md h-10 w-1/2 mt-4 ml-auto">
                                                    Add Seller
                                                </Button>
                                                {/* </div> */}
                                            </div>
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
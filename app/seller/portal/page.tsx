'use client';
import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import PortalMenu from "@/components/portal-menu";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSeller } from "@/lib/auth/role";

export default function SellerPortalPage() {
    const router = useRouter();


    useEffect(() => {
        async function checkEstateAgent() {
            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getClaims();
                const user = data?.claims;
                const seller = await isSeller(user?.metadata?.sub);
                
                if (!seller) {
                    router.push("/");
                }
            } catch (error) {
                console.error("Error validating seller access:", error);
                router.push("/");
            }
        }

        checkEstateAgent();
    }, [router]);

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <PortalMenu role={"seller"} />
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Seller Portal</CardTitle>
                            <CardDescription>
                                Welcome to the seller portal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Use the menu at the top of this page to navigate between seller tasks.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

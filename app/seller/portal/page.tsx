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
import { validateUser } from "@/lib/auth/user";
import { isSeller } from "@/lib/auth/role";

export default function SellerPortalPage() {
    const router = useRouter();


    useEffect(() => {
        async function checkEstateAgent() {
            try {
                const user = await validateUser();
                if (!user) {
                    router.push("/public/home");
                    return;
                }
                const seller = await isSeller(user.user.id);
                if (!seller) {
                    router.push("/public/home");
                }
            } catch (error) {
                console.error("Error validating seller access:", error);
                router.push("/public/home");
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

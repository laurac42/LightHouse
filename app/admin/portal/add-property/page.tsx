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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth/user";
import { isAdmin } from "@/lib/auth/role";
import AddPropertyForm from "@/components/add-property-form";
import { createClient } from "@/lib/supabase/client";

export default function AdminPortalPage() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        async function checkAdmin() {
            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getClaims();
                const user = data?.claims;
                const admin = await isAdmin();
                if (!admin) {
                    router.push("/public/home");
                    return;
                }
                setUser(user?.user_metadata?.sub || null);
            } catch (error) {
                console.error("Error validating admin access:", error);
                router.push("/public/home");
            }
        }

        checkAdmin();
    }, [router]);

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <PortalMenu role={"admin"} />
                    {user && <AddPropertyForm role={"admin"} id={user} />}
                </div>
            </div>
        </div>
    );
}

'use client';
import Navbar from "@/components/navbar";
import AddPropertyForm from "@/components/add-property-form";
import PortalMenu from "@/components/portal-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth/user";
import { isAdmin, isEstateAgent } from "@/lib/auth/role";

export default function EstateAgentPortalPage() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        async function checkEstateAgent() {
            try {
                const user = await validateUser();
                if (!user) {
                    router.push("/public/home");
                    return;
                }
                const estateAgent = await isEstateAgent();
                if (!estateAgent) {
                    router.push("/public/home");
                    return;
                }
                setUser(user.user.id);
            } catch (error) {
                console.error("Error validating estate agent access:", error);
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
                    <PortalMenu role={"estate-agent"} />
                    {user &&
                        <AddPropertyForm role={"estate-agent"} id={user} />
                    }
                </div>
            </div>
        </div>
    );
}

'use client';
import Navbar from "@/components/navbar";
import AddPropertyForm from "@/components/add-property-form";
import PortalMenu from "@/components/portal-menu";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth/user";
import { isAdmin, isEstateAgent } from "@/lib/auth/role";

export default function EstateAgentPortalPage() {
    const router = useRouter();


    useEffect(() => {
        async function checkEstateAgent() {
            const user = await validateUser();
            if (!user) {
                router.push("/public/home");
                return;
            }
            const estateAgent = await isEstateAgent();
            if (!estateAgent) {
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
                    <AddPropertyForm /> 
                </div>
            </div>
        </div>
    );
}

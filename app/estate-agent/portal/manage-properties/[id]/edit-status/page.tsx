'use client';
import { Suspense, use, useEffect } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { EditStatusForm } from "@/components/edit-status-form";
import { validateUser } from "@/lib/auth/user";
import { isEstateAgent } from "@/lib/auth/role";
import { useRouter } from "next/navigation";

export function EditStatus({ params }: { params: Promise<{ id: number }> }) {
    const { id } = use(params);
    const router = useRouter();

    // check user is authenticated to be on this page
    useEffect(() => {
        async function checkAgent() {
            try {
                const user = await validateUser();
                if (!user) {
                    router.push("/");
                    return;
                }
                const agent = await isEstateAgent();
                if (!agent) {
                    router.push("/");
                }
            } catch (error) {
                console.error("Error validating estate agent access:", error);
                router.push("/");
            }
        }

        checkAgent();
    }, [router]);

    return (

        <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
            <div className="w-full max-w-5xl">
                <EditStatusForm propertyId={id} />
            </div>
        </div>
    );
}


// Separate component to allow use of suspense for loading state while fetching property details and agency details
export default function EditStatusPage({ params }: { params: Promise<{ id: number }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>

            <div className="bg-background min-h-screen w-full">
                <Navbar />
                <Link className="flex inline-flex text-highlight m-6 mb-0 mt-4" href="/estate-agent/portal/manage-properties"><MoveLeft /> &nbsp; Back to Agent Portal</Link>
                <EditStatus params={params} />
            </div>
        </Suspense>
    );
}
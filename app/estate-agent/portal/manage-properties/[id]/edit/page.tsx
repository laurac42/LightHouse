'use client';
import { Suspense, use, useEffect } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import EditPropertyForm from "@/components/edit-property-form";
import { validateUser } from "@/lib/auth/user";
import { isEstateAgent } from "@/lib/auth/role";
import { useRouter } from "next/navigation"; 

export function EditProperty({ params }: { params: Promise<{ id: number }> }) {
    const { id } = use(params);
    const router = useRouter();

    // check user is authenticated to be on this page
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

        <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
            <div className="w-full max-w-5xl">
                <EditPropertyForm propertyId={id} role="agent"/>
            </div>
        </div>
    );
}


// Separate component to allow use of suspense for loading state while fetching property details and agency details
export default function EditPropertyPage({ params }: { params: Promise<{ id: number }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>

            <div className="bg-background min-h-screen w-full">
                <Navbar />
                <Link className="flex inline-flex text-highlight m-6 mb-0 mt-4" href="/estate-agent/portal/manage-properties"><MoveLeft /> &nbsp; Back to Agent Portal</Link>
                <EditProperty params={params} />
            </div>
        </Suspense>
    );
}
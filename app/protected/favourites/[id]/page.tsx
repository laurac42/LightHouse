import { Suspense } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { PropertyDetailsPage } from "@/app/properties/[id]/page";
import { MoveLeft } from "lucide-react";

// Separate component to allow use of suspense for loading state while fetching property details and agency details
export default function Page({ params }: { params: Promise<{ id: number }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>

            <div className="bg-background min-h-screen w-full">
                <Navbar />
                <Link className="flex inline-flex text-highlight m-6 mb-0 mt-4" href="/protected/favourites"><MoveLeft /> &nbsp; Back to Favourites</Link>
                <PropertyDetailsPage params={params} />
            </div>
        </Suspense> 
    );
}
'use client';
import { Suspense } from "react";
import { use } from "react";

function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div>
            <h1>Property Details</h1>
            <p>Property ID: {id}</p>
        </div>
    );

}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PropertyDetails params={params} />
        </Suspense>
    );
}
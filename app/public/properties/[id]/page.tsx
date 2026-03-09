'use client';
import { Suspense, useEffect } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { error } from "console";

type Property = Database["public"]["Tables"]["properties"]["Row"];

function PropertyDetails({ params }: { params: Promise<{ id: number }> }) {
    const { id } = use(params);
    const property = use(fetchPropertyDetails(id));

    async function fetchPropertyDetails(id: number): Promise<Property | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                throw new Error(error.message);
            }
            return data;
        } catch (error) {
            console.error("Error fetching property details:", error);
            return null;
        }
    }

    return (
        <div>
            <h1>Property Details</h1>
            <p>Property ID: {id}</p>
            {property && (
                <div>
                    <p>Property Name: {property.title}</p>
                    <p>Property Description: {property.description}</p>
                </div>
            )}
        </div>
    );

}

export default function Page({ params }: { params: Promise<{ id: number }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PropertyDetails params={params} />
        </Suspense>
    );
}
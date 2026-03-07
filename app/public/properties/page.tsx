"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function Page() {

    const [properties, setProperties] = useState<any[]>([]);
    async function fetchProperties() {
        try {
            const supabase = await createClient();
            const response = await supabase.from("properties").select("*");
            console.log("Fetched properties: ", response.data);
            setProperties(response.data || []);
        } catch (error) {
            console.error("Error fetching properties: ", error);
        }
    }

    useEffect(() => {
        fetchProperties();
    }, []);

    return (
        <div className="bg-backgroundmin-h-screen w-full">
            <Navbar />
            <FilterBar />
            <div className="flex w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                        {properties.map((property) => (
                            <Card key={property.id} className="bg-white/90 border-none mb-6">
                                <CardHeader>
                                    <CardTitle className="text-2xl flex gap-4 pt-2">
                                        {property.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{property.description}</p>
                                    </CardContent>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    );
}

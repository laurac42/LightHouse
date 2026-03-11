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
import { isAdmin, isEstateAgent, getAgentsLocationId } from "@/lib/auth/role"
import { fetchPropertiesByLocationID } from "@/lib/data/property";
import { Database } from "@/types/supabase";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function EstateAgentPropertiesPage() {
    const router = useRouter();
    const [locationId, setLocationId] = useState<string | null>();
    const [properties, setProperties] = useState<Property[]>([]);
    const [user, setUser] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        async function checkEstateAgent() {
            const user = await validateUser();
            if (!user) {
                router.push("/public/home");
                return;
            }
            setUser(user);
            const estateAgent = await isEstateAgent();
            if (!estateAgent) {
                router.push("/public/home");
            }
        }

        checkEstateAgent();
    }, [router]);

    // load properties
    useEffect(() => {
        if (!user) return; // wait until user has been set


        const loadProperties = async () => {
            try {
                const locID = await getAgentsLocationId(user.user.id);
                if (locID?.estate_agency_location_id) {
                    setLocationId(locID.estate_agency_location_id);
                    console.log(locationId);

                    const ps = await fetchPropertiesByLocationID(locID.estate_agency_location_id);
                    if (ps) {
                        setProperties(ps);
                    } else {
                        setErrorMessage("Unable to fetch properties for your agency location");
                    }
                } else {
                    setErrorMessage("Unable to find estate agency location");
                }
            } catch (error) {
                console.error("Error loading properties: ", error);

            } finally {
                setLoading(false);
            }
        }
        loadProperties();

    }, [user]);

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <PortalMenu role={"estate-agent"} />
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Manage Properties</CardTitle>
                            <CardDescription>
                                Here you can view all properties at your agency location, add new properties, and edit or delete existing properties.
                                You are able to view all properties at your agency, and <b>edit only properties which you have added</b>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                All Properties
                            </p>
                            {loading ? (
                                <p>Loading properties ...</p>
                            ) : (
                                <>
                                    {properties.length === 0 && <p>No properties found for your agency location.</p>}
                                    {properties.map(property =>
                                        <div key={property.id}>{property.title}</div>
                                    )}
                                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

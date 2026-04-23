'use client';
import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckOnboarding } from "@/lib/auth/onboarding";
import { validateUser } from "@/lib/auth/user";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, InputGroupButton } from "@/components/ui/input-group";

export default function BuyerProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [familySize, setFamilySize] = useState<number>(1);
    const [budget, setBudget] = useState<string>("");
    const [bedrooms, setBedrooms] = useState<string>("");
    const [detachedChecked, setDetachedChecked] = useState(false);
    const [semiDetachedChecked, setSemiDetachedChecked] = useState(false);
    const [terracedChecked, setTerracedChecked] = useState(false);
    const [flatChecked, setFlatChecked] = useState(false);
    const [bungalowChecked, setBungalowChecked] = useState(false);
    const [landChecked, setLandChecked] = useState(false);
    const [commercialChecked, setCommercialChecked] = useState(false);
    const [locations, setLocations] = useState<string[]>([]);
    const [inputLocation, setInputLocation] = useState<string>("");
    const router = useRouter();


    useEffect(() => {
        async function verifyOnboarding() {
            const status = await CheckOnboarding();

            // if (status === "error") {
            //     router.push("/");
            // } else if (status === "onboarded") {
            //     router.push("/");
            // }
        }

        verifyOnboarding();
    }, [router]);

    /**
     * Handle the user clicking the from submit button. This will update the user's details in the database and mark them as onboarded.
     * @param e event object from the form submission
     * @returns void 
     */
    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setIsLoading(true);

        try {
            let user = await validateUser();
            if (!user) {
                throw new Error("Error fetching user details. Please try again.");
            }
            const supabase = await createClient();

            // Update buyer profile with details from form
            const { error: updateError } = await supabase.rpc
                ("update_buyer_profile", {
                    p_id: user.user.id,
                    p_budget: budget !== "" ? Number(budget) : 0,
                    p_family_size: familySize,
                    p_preferred_num_bedrooms: bedrooms !== "" ? Number(bedrooms) : 0,
                    p_preferred_property_types: [
                        detachedChecked ? "detached" : null,
                        semiDetachedChecked ? "semi-detached" : null,
                        terracedChecked ? "terraced" : null,
                        flatChecked ? "flat" : null,
                        bungalowChecked ? "bungalow" : null,
                        landChecked ? "land" : null,
                        commercialChecked ? "commercial" : null,
                    ].filter(Boolean) as string[],
                    p_preferred_locations: locations,
                });

            if (updateError) {
                throw new Error(updateError.message);
            }
            router.push("/onboarding/locations");
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
            console.error("Error in handleDetailsSubmit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="flex w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-6">
                        <Card className="bg-white/90 border-none">
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Let's set up your buyer profile
                                </CardTitle>
                                <CardDescription>Let us know a bit more about what you're looking for, and help us guide you to your perfect home.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleDetailsSubmit}>
                                    <div className="flex flex-col gap-6">
                                        {/* Budget */}
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="budget">Give us an idea of your budget?</Label>
                                            <div className="relative">
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <InputGroupText>£</InputGroupText>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        placeholder="250,000"
                                                        value={budget}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        min={0}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "" || /^[0-9]+$/.test(val)) {
                                                                setBudget(val);
                                                            }
                                                        }}
                                                    />
                                                    <InputGroupAddon align="inline-end">
                                                        <InputGroupText>GBP</InputGroupText>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </div>
                                        </div>

                                        {/* Number of People Buying For */}
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="family-size">How many people will be living in the home?</Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    placeholder="0"
                                                    value={familySize}
                                                    type="number"
                                                    min={0}
                                                    onChange={(e) => setFamilySize(parseInt(e.target.value) || 0)}
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupText>Family Members</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>

                                        {/* Number of Bedrooms */}
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="bedrooms">How many bedrooms would you like?</Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    placeholder="2"
                                                    value={bedrooms}
                                                    type="number"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || /^[0-9]+$/.test(val)) {
                                                            setBedrooms(val);
                                                        }
                                                    }}
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupText>Bedrooms</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>

                                        {/* Locations */}
                                        <div className="flex flex-col gap-2">
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="locations-input">Are there any specific locations you're interested in?</FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id="locations-input"
                                                            placeholder="Enter a location..."
                                                            value={inputLocation}
                                                            onChange={(e) => setInputLocation(e.target.value)}
                                                        />
                                                        <InputGroupAddon align="inline-end">
                                                            <InputGroupButton
                                                                size="xs"
                                                                className="bg-buttonColor hover:bg-buttonHover text-foreground ml-auto"
                                                                onClick={() => {
                                                                    if (inputLocation.trim() !== "") {
                                                                        setLocations([...locations, inputLocation.trim()]);
                                                                        setInputLocation("");
                                                                    }
                                                                }}
                                                            >
                                                                Add +
                                                            </InputGroupButton>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </Field>
                                            </FieldGroup>
                                            {locations.length > 0 &&
                                                (<div className="flex flex-wrap gap-2">
                                                    {locations.map((location, index) => (
                                                        <Badge key={index} variant="outline" className="bg-midBlue text-foreground border-foreground">
                                                            {location}
                                                            <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => {
                                                                setLocations(locations.filter((_, i) => i !== index));
                                                            }}>
                                                                X
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                </div>)}

                                        </div>

                                        {/* Preferred Property Types */}
                                        <div className="flex flex-col gap-2">
                                            <FieldSet>
                                                <FieldLegend variant="label">
                                                    What property types are you interested in?
                                                </FieldLegend>
                                                <FieldGroup className="grid grid-cols-2 gap-3">
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="detached-checkbox" name="detached-checkbox" checked={detachedChecked} onCheckedChange={() => setDetachedChecked(!detachedChecked)} />
                                                        <FieldLabel htmlFor="detached-checkbox" className="font-normal">
                                                            Detached
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="semi-detached-checkbox" name="semi-detached-checkbox" checked={semiDetachedChecked} onCheckedChange={() => setSemiDetachedChecked(!semiDetachedChecked)} />
                                                        <FieldLabel htmlFor="semi-detached-checkbox" className="font-normal">
                                                            Semi-detached
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="terraced-checkbox" name="terraced-checkbox" checked={terracedChecked} onCheckedChange={() => setTerracedChecked(!terracedChecked)} />
                                                        <FieldLabel htmlFor="terraced-checkbox" className="font-normal">
                                                            Terraced
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="flat-checkbox" name="flat-checkbox" checked={flatChecked} onCheckedChange={() => setFlatChecked(!flatChecked)} />
                                                        <FieldLabel htmlFor="flat-checkbox" className="font-normal">
                                                            Flat
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="bungalow-checkbox" name="bungalow-checkbox" checked={bungalowChecked} onCheckedChange={() => setBungalowChecked(!bungalowChecked)} />
                                                        <FieldLabel htmlFor="bungalow-checkbox" className="font-normal">
                                                            Bungalow
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="land-checkbox" name="land-checkbox" checked={landChecked} onCheckedChange={() => setLandChecked(!landChecked)} />
                                                        <FieldLabel htmlFor="land-checkbox" className="font-normal">
                                                            Land
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id="commercial-checkbox" name="commercial-checkbox" checked={commercialChecked} onCheckedChange={() => setCommercialChecked(!commercialChecked)} />
                                                        <FieldLabel htmlFor="commercial-checkbox" className="font-normal">
                                                            Commercial Property
                                                        </FieldLabel>
                                                    </Field>
                                                </FieldGroup>
                                            </FieldSet>
                                        </div>

                                        {error && <p className="text-sm text-red-500">{error}</p>}
                                        <Button type="submit" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-xl" disabled={isLoading}>
                                            {isLoading ? "Adding your details..." : "Complete Profile"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

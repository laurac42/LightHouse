"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

export default function Page() {
    const [location, setLocation] = useState<string>("");
    return (
        <div className="bg-[url(/images/background.jpg)] bg-cover bg-top min-h-screen w-full">
            <Navbar />
            <p className="text-center text-4xl font-bold drop-shadow-lg pt-8 pb-8">Guiding you to your perfect home</p>
            <div className="flex w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-6">
                        <Card className="bg-white/90 border-none">
                            <CardHeader>
                                <CardTitle className="text-2xl flex gap-4">
                                    <Button variant="link" size="lg" className="p-0 text-lg text-foreground active:underline focus:underline underline-offset-8">
                                        Buy
                                    </Button>
                                    <Button variant="link" size="lg" className="p-0 text-lg text-foreground active:underline focus:underline underline-offset-8">
                                        House Prices
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="location">Search for properties in your desired location</Label>
                                    <InputGroup className="border border-foreground flex h-full">
                                        
                                            <InputGroupInput
                                                placeholder="e.g. Dundee, Monifieth ..."
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="flex-1 border-none"
                                            />
                                            <InputGroupAddon>
                                                <Search />
                                            </InputGroupAddon>
                                            <InputGroupButton size="sm" className="hidden md:flex bg-buttonColor hover:bg-buttonHover text-md text-foreground font-bold md:w-32 h-full">Search</InputGroupButton>
                                    </InputGroup>
                                    <Button size="sm" className="flex md:hidden bg-buttonColor hover:bg-buttonHover text-foreground text-md font-bold w-full h-10">Search</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

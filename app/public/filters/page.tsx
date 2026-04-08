"use client";
import Navbar from "@/components/navbar";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import type { Filters } from "@/types/filters";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";  

export default function FiltersPage() {
    const [filters, setFilters] = useState<Filters>({
        location: "",
        selectedTags: [],
        milesRadius: null,
        minPrice: null,
        maxPrice: null,
        minBedrooms: null,
        maxBedrooms: null,
        minBathrooms: null,
        maxBathrooms: null,
        propertyTypes: [],
        garage: null,
        garden: null,
        driveway: null,
        new_build: null,
        min_sqft: null,
        max_sqft: null,
        min_epc_rating: null,
        max_epc_rating: null,
        min_council_tax_band: null,
        max_council_tax_band: null,
        include_under_offer: true,
        include_new_builds: true,
    });
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    const updateMedia = useCallback(() => {
        setIsMobile(window.innerWidth < 850);
    }, []);

    useEffect(() => {
        updateMedia();
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const locationParam = urlParams.get("location");
        setFilters((prev: Filters) => ({
            ...prev,
            location: locationParam ? locationParam : prev.location,
        }));
    }, []);

    const updateLocalFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev: Filters) => ({
            ...prev,
            [key]: value,
        }));
    };

    /**
     * Apply filters by passing them into the url parameters on the search results page
     */
    function applyFilters() {
        const params = new URLSearchParams();
        const location = filters.location.trim();

        if (location) params.set("location", location);
        if (filters.selectedTags.length > 0) params.set("selectedTags", filters.selectedTags.join(","));
        if (filters.milesRadius !== null) params.set("milesRadius", String(filters.milesRadius));

        if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));

        if (filters.minBedrooms !== null) params.set("minBedrooms", String(filters.minBedrooms));
        if (filters.maxBedrooms !== null) params.set("maxBedrooms", String(filters.maxBedrooms));

        if (filters.minBathrooms !== null) params.set("minBathrooms", String(filters.minBathrooms));
        if (filters.maxBathrooms !== null) params.set("maxBathrooms", String(filters.maxBathrooms));

        if (filters.propertyTypes.length > 0) params.set("propertyTypes", filters.propertyTypes.join(","));

        if (filters.garage === true) params.set("garage", "true");
        if (filters.garden === true) params.set("garden", "true");
        if (filters.driveway === true) params.set("driveway", "true");
        if (filters.new_build === true) params.set("new_build", "true");

        const query = params.toString();
        router.push(query ? `/public/properties?${query}` : "/public/properties");
    }



    return (
        <div className="bg-background w-full min-h-screen flex flex-col mb-20">
            <Navbar />
            <div className="w-full">
                <svg className="hidden md:block" viewBox="0 0 1200 160" width={"100%"}>
                    <path d="M0,0 C20,30 50,40 150,50 L900,50 C1120,60 1160,90 1200,90"
                        fill="none" stroke="black" strokeWidth="3" />
                    <text className="text-3xl fill-foreground" x="600" y="80" textAnchor="middle" dominantBaseline="middle">Help us guide you to the right home</text>
                    <path d="M0,60 C20,90 50,100 150,110 L900,110 C1120,130 1160,160 1200,160"
                        fill="none" stroke="black" strokeWidth="3" />
                </svg>
                <h1 className="text-3xl mt-12 px-4 md:hidden flex justify-center text-center">Help us guide you to the right home</h1>
            </div>

            <div className="w-full flex justify-center pt-0 mt-0">
                <div className="w-full lg:w-4/5 grid grid-cols-2 md:grid-cols-3 gap-4 px-8 md:px-8 lg:px-12 pb-8 mt-8">
                    <Card className="bg-midBlue border-none h-[110px] col-span-1">
                        <CardContent className="h-full flex flex-col justify-center gap-2 px-2 md:px-4">
                            <DropdownMenuLabel className="text-md font-bold">Search Radius</DropdownMenuLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" className="w-full bg-white hover:bg-lightPink justify-between" variant="outline">{filters.milesRadius === null ? "This area only" : filters.milesRadius === 1 ? "Within 1 mile" : `Within ${filters.milesRadius} miles`}<ChevronDown /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => { if (filters.location) { updateLocalFilter("milesRadius", null); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>This area only</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (filters.location) { updateLocalFilter("milesRadius", 1); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 1 mile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (filters.location) { updateLocalFilter("milesRadius", 2); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 2 miles</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (filters.location) { updateLocalFilter("milesRadius", 5); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 5 miles</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (filters.location) { updateLocalFilter("milesRadius", 10); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 10 miles</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>

                    <Card className="bg-midBlue border-none h-[110px] col-span-1">
                        <CardContent className="h-full flex flex-col justify-center gap-2 px-2 md:px-4">
                            <DropdownMenuLabel className="text-md font-bold">Price Range</DropdownMenuLabel>
                            {isMobile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full bg-white hover:bg-lightPink justify-between">
                                            {!filters.minPrice && !filters.maxPrice ? "Price Range" :
                                                `${filters.minPrice && !filters.maxPrice ? "£" + filters.minPrice.toLocaleString() + " min" : ""}
                            ${filters.minPrice && filters.maxPrice ? "£" + filters.minPrice.toLocaleString() + " - " + "£" + filters.maxPrice.toLocaleString() : ""}
                            ${filters.maxPrice && !filters.minPrice ? "£" + filters.maxPrice.toLocaleString() + " max" : ""}`}
                                            <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="z-[104]">
                                        <DropdownMenuGroup>
                                            <div className="flex flex-row gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                            {filters.minPrice ? "£" + filters.minPrice.toLocaleString() : "Min Price"} <ChevronDown />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => { updateLocalFilter("minPrice", null); }}>No min</DropdownMenuItem>
                                                            {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                                filters.maxPrice === null || (filters.maxPrice !== null && price < filters.maxPrice) ? (
                                                                    <DropdownMenuItem key={index} onClick={() => { updateLocalFilter("minPrice", price); }}>£{price.toLocaleString()}</DropdownMenuItem>
                                                                ) : null
                                                            ))}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <p className="my-auto">to</p>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                            {filters.maxPrice ? "£" + filters.maxPrice.toLocaleString() : "Max Price"} <ChevronDown />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => { updateLocalFilter("maxPrice", null); }}>No max</DropdownMenuItem>
                                                            {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                                filters.minPrice === null || (filters.minPrice !== null && price > filters.minPrice) ? (
                                                                    <DropdownMenuItem key={index} onClick={() => { updateLocalFilter("maxPrice", price); }}>£{price.toLocaleString()}</DropdownMenuItem>
                                                                ) : null
                                                            ))}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex flex-row gap-2 justify-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink justify-between">
                                                {filters.minPrice ? "£" + filters.minPrice.toLocaleString() : "Min Price"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("minPrice", null); }}>No Min</DropdownMenuItem>
                                                {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                    filters.maxPrice === null || (filters.maxPrice !== null && price < filters.maxPrice) ? (
                                                        <DropdownMenuItem key={index} onClick={() => updateLocalFilter("minPrice", price)}>£{price.toLocaleString()}</DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink justify-betweenw">
                                                {filters.maxPrice ? "£" + filters.maxPrice.toLocaleString() : "Max Price"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("maxPrice", null); }}>No max</DropdownMenuItem>
                                                {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                    filters.minPrice === null || (filters.minPrice !== null && price > filters.minPrice) ? (
                                                        <DropdownMenuItem key={index} onClick={() => updateLocalFilter("maxPrice", price)}>£{price.toLocaleString()}</DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-midBlue border-none h-[110px]">
                        <CardContent className="h-full flex flex-col justify-center gap-2 px-2 md:px-4">
                            <DropdownMenuLabel className="text-md font-bold">{!isMobile && 'Number of'} Bedrooms</DropdownMenuLabel>
                            {isMobile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full bg-white hover:bg-lightPink justify-between">
                                            {!filters.minBedrooms && !filters.maxBedrooms ? "Num Bedrooms" :
                                                `${filters.minBedrooms && !filters.maxBedrooms ? filters.minBedrooms + " beds min" : ""}
                            ${filters.minBedrooms && filters.maxBedrooms ? filters.minBedrooms + "-" + filters.maxBedrooms + " beds" : ""}
                            ${filters.maxBedrooms && !filters.minBedrooms ? filters.maxBedrooms + " beds max" : ""}`}
                                            <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="z-[104]">
                                        <DropdownMenuGroup>
                                            <div className="flex flex-row gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                            {filters.minBedrooms ? filters.minBedrooms + " Bedrooms" : "Min Bedrooms"} <ChevronDown />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => { updateLocalFilter("minBedrooms", null); }}>No min</DropdownMenuItem>
                                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                                filters.maxBedrooms === null || (filters.maxBedrooms !== null && bed < filters.maxBedrooms) ? (
                                                                    <DropdownMenuItem key={bed} onClick={() => { updateLocalFilter("minBedrooms", bed); }}>
                                                                        {bed} Bed{index === 0 ? "" : "s"}
                                                                    </DropdownMenuItem>
                                                                ) : null
                                                            ))}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                            {filters.maxBedrooms ? filters.maxBedrooms + " Bedrooms" : "Max Bedrooms"} <ChevronDown />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => { updateLocalFilter("maxBedrooms", null); }}>No max</DropdownMenuItem>
                                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                                filters.minBedrooms === null || (filters.minBedrooms !== null && bed > filters.minBedrooms) ? (
                                                                    <DropdownMenuItem key={bed} onClick={() => { updateLocalFilter("maxBedrooms", bed); }}>
                                                                        {bed} Bed{index === 0 ? "" : "s"}
                                                                    </DropdownMenuItem>
                                                                ) : null
                                                            ))}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex flex-row gap-2 justify-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink justify-between">
                                                {filters.minBedrooms ? filters.minBedrooms : "Min"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("minBedrooms", null); }}>No min</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                    filters.maxBedrooms === null || (filters.maxBedrooms !== null && bed < filters.maxBedrooms) ? (
                                                        <DropdownMenuItem key={bed} onClick={() => updateLocalFilter("minBedrooms", bed)}>
                                                            {bed} Bed{index === 0 ? "" : "s"}
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink justify-between">
                                                {filters.maxBedrooms ? filters.maxBedrooms : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("maxBedrooms", null); }}>No max</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                    filters.minBedrooms === null || (filters.minBedrooms !== null && bed > filters.minBedrooms) ? (
                                                        <DropdownMenuItem key={bed} onClick={() => updateLocalFilter("maxBedrooms", bed)}>
                                                            {bed} Bed{index === 0 ? "" : "s"}
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">bedrooms</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-midBlue border-none h-[110px]">
                        <CardContent className="h-full flex flex-col justify-center gap-2 px-2 md:px-4">
                            <DropdownMenuLabel className="text-md font-bold">{!isMobile && 'Number of'}  Bathrooms</DropdownMenuLabel>
                            {isMobile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full bg-white hover:bg-lightPink justify-between">
                                            {!filters.minBathrooms && !filters.maxBathrooms ? "Num Bathrooms" :
                                                `${filters.minBathrooms && !filters.maxBathrooms ? filters.minBathrooms + " baths min" : ""}
                            ${filters.minBathrooms && filters.maxBathrooms ? filters.minBathrooms + "-" + filters.maxBathrooms + " baths" : ""}
                            ${filters.maxBathrooms && !filters.minBathrooms ? filters.maxBathrooms + " baths max" : ""}`}
                                            <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="z-[104]">
                                        <DropdownMenuGroup>
                                            <div className="flex flex-row gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                            {filters.minBathrooms ? filters.minBathrooms + " Bathrooms" : "Min Bathrooms"} <ChevronDown />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => { updateLocalFilter("minBathrooms", null); }}>No min</DropdownMenuItem>
                                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                                filters.maxBathrooms === null || (filters.maxBathrooms !== null && bath < filters.maxBathrooms) ? (
                                                                    <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("minBathrooms", bath); }}>
                                                                        {bath} Bathroom{index === 0 ? "" : "s"}
                                                                    </DropdownMenuItem>
                                                                ) : null
                                                            ))}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                            {filters.maxBathrooms ? filters.maxBathrooms + " Bathrooms" : "Max Bathrooms"} <ChevronDown />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => { updateLocalFilter("maxBathrooms", null); }}>No max</DropdownMenuItem>
                                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                                filters.minBathrooms === null || (filters.minBathrooms !== null && bath > filters.minBathrooms) ? (
                                                                    <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("maxBathrooms", bath); }}>
                                                                        {bath} Bathroom{index === 0 ? "" : "s"}
                                                                    </DropdownMenuItem>
                                                                ) : null))
                                                            }
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink justify-between">
                                                {filters.minBathrooms ? filters.minBathrooms : "Min"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("minBathrooms", null); }}>No min</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                    filters.maxBathrooms === null || (filters.maxBathrooms !== null && bath < filters.maxBathrooms) ? (
                                                        <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("minBathrooms", bath); }}>
                                                            {bath} Bathroom{index === 0 ? "" : "s"}
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink justify-between">
                                                {filters.maxBathrooms ? filters.maxBathrooms : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("maxBathrooms", null); }}>No max</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                    filters.minBathrooms === null || (filters.minBathrooms !== null && bath > filters.minBathrooms) ? (
                                                        <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("maxBathrooms", bath); }}>
                                                            {bath} Bathroom{index === 0 ? "" : "s"}
                                                        </DropdownMenuItem>
                                                    ) : null))
                                                }
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">Bathrooms</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-midBlue border-none h-[110px]">
                        <CardContent className="h-full flex flex-col justify-center gap-2 px-2 md:px-4">
                            <DropdownMenuLabel className="text-md font-bold">Property Types</DropdownMenuLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="w-full bg-white hover:bg-lightPink flex items-center justify-between gap-2"
                                        variant="outline"
                                    >
                                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                                            {filters.propertyTypes.length === 0 ? "All Property Types" : filters.propertyTypes.join(", ")}
                                        </span>
                                        <ChevronDown className="shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="z-[104]">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => { updateLocalFilter("propertyTypes", []); }}>Show all</DropdownMenuItem>
                                        {["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Land", "Commercial"].map((type) => (
                                            <DropdownMenuItem key={type} onClick={() => {
                                                if (filters.propertyTypes.includes(type)) {
                                                    updateLocalFilter("propertyTypes", filters.propertyTypes.filter((t) => t !== type));
                                                } else {
                                                    updateLocalFilter("propertyTypes", [...filters.propertyTypes, type]);
                                                }
                                            }}>
                                                <input type="checkbox" checked={filters.propertyTypes.includes(type)} readOnly className="mr-2" />
                                                {type}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>

                    <Card className="bg-midBlue border-none h-[165px] md:h-[110px]">
                        <CardContent className="h-full flex flex-col justify-center px-4 gap-2">
                            <div>
                                <FieldSet>
                                    <FieldLegend variant="label">
                                        <h3 className="text-lg font-bold mt-2">Must Have</h3>
                                    </FieldLegend>
                                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="garage"
                                                name="garage"
                                                checked={filters.garage === true}
                                                onCheckedChange={() => updateLocalFilter("garage", !filters.garage)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="garage"
                                                className="font-normal"
                                            >
                                                Garage
                                            </FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="driveway"
                                                name="driveway"
                                                checked={filters.driveway === true}
                                                onCheckedChange={() => updateLocalFilter("driveway", !filters.driveway)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="driveway"
                                                className="font-normal"
                                            >
                                                Driveway
                                            </FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="garden"
                                                name="garden"
                                                checked={filters.garden === true}
                                                onCheckedChange={() => updateLocalFilter("garden", !filters.garden)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="garden"
                                                className="font-normal"
                                            >
                                                Garden
                                            </FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="new_build"
                                                name="new_build"
                                                checked={filters.new_build === true}
                                                onCheckedChange={() => updateLocalFilter("new_build", !filters.new_build)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="new_build"
                                                className="font-normal"
                                            >
                                                New Build
                                            </FieldLabel>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={applyFilters}
                        className="col-start-2 md:col-start-3 w-full bg-buttonColor hover:bg-buttonHover text-foreground text-lg font-bold mt-2 h-12">
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    )
}
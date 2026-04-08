
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { X, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tag } from "@/types/tags";
import { fetchAllTags } from "@/lib/data/tag-utils";
import FilterBarOverlay from "@/components/filter-bar-overlay";
import type { Filters } from "@/types/filters";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

type FilterBarProps = {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export default function FilterBar({ filters, setFilters }: FilterBarProps) {
    const [fils, setFils] = useState<Filters>(filters);
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState<boolean>(false);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    // update filters by updating the url parameters
    const updateFilters = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
        
        const params = new URLSearchParams(searchParams.toString())

        if (value === null || value === undefined || value === "") {
            params.delete(String(key))
        } else {
            params.set(String(key), String(value))
        }

        router.replace(`?${params.toString()}`)
    }

    useEffect(() => {
        setFils(filters);
    }, [filters]);

    const updateLocalFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFils((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // toggle scrolling on main page when more filters is opened/closed
    useEffect(() => {
        if (isMoreFiltersOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [isMoreFiltersOpen]);

    useEffect(() => {
        async function loadTags() {
            try {
                const tags = await fetchAllTags();
                setAllTags(tags);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        }
        loadTags();
    }, []);

    return (
        <div className="w-full bg-highlight p-4 shadow-sm shadow-highlight">
            <div className="flex flex-row gap-3">
                <InputGroup className="border border-foreground flex flex-1 bg-white ">
                    <InputGroupInput
                        placeholder="e.g. Dundee, Monifieth ..."
                        value={fils.location}
                        onChange={(e) => updateLocalFilter("location", e.target.value)}
                        className="flex-1 border-none"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const value = (e.target as HTMLInputElement).value;
                                updateLocalFilter("location", value);
                                updateFilters("location", value);
                                // set url params
                                const params = new URLSearchParams(window.location.search);
                                params.set("location", value);
                                window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                            }
                        }}
                    />
                    <InputGroupButton size="sm" className="text-md text-foreground bg-white hover:bg-lightPink md:w-10 h-full"><X /></InputGroupButton>
                </InputGroup>

                {/* Search Radius */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-32 bg-white hover:bg-lightPink hidden sm:flex" variant="outline">{fils.milesRadius === null ? "This area only" : fils.milesRadius === 1 ? "Within 1 mile" : `Within ${fils.milesRadius} miles`}<ChevronDown /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => { if (fils.location) { updateLocalFilter("milesRadius", null); updateFilters("milesRadius", null); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>This area only</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if (fils.location) { updateLocalFilter("milesRadius", 1); updateFilters("milesRadius", 1); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 1 mile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if (fils.location) { updateLocalFilter("milesRadius", 2); updateFilters("milesRadius", 2); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 2 miles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if (fils.location) { updateLocalFilter("milesRadius", 5); updateFilters("milesRadius", 5); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 5 miles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if (fils.location) { updateLocalFilter("milesRadius", 10); updateFilters("milesRadius", 10); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 10 miles</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="max-w-45 hidden sm:flex bg-white hover:bg-lightPink">
                            {!fils.minPrice && !fils.maxPrice ? "Price Range" :
                                `${fils.minPrice && !fils.maxPrice ? "£" + fils.minPrice.toLocaleString() + " min" : ""}
                            ${fils.minPrice && fils.maxPrice ? "£" + fils.minPrice.toLocaleString() + " - " + "£" + fils.maxPrice.toLocaleString() : ""}
                            ${fils.maxPrice && !fils.minPrice ? "£" + fils.maxPrice.toLocaleString() + " max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">{fils.minPrice ? "£" + fils.minPrice.toLocaleString() : "Min Price"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("minPrice", null); updateFilters("minPrice", null); }}>No min</DropdownMenuItem>
                                            {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                fils.maxPrice === null || (fils.maxPrice !== null && price < fils.maxPrice) ? (
                                                    <DropdownMenuItem key={index} onClick={() => { updateLocalFilter("minPrice", price); updateFilters("minPrice", price); }}>£{price.toLocaleString()}</DropdownMenuItem>
                                                ) : null
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <p className="my-auto">to</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">{fils.maxPrice ? "£" + fils.maxPrice.toLocaleString() : "Max Price"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("maxPrice", null); updateFilters("maxPrice", null); }}>No max</DropdownMenuItem>
                                            {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                fils.minPrice === null || (fils.minPrice !== null && price > fils.minPrice) ? (
                                                    <DropdownMenuItem key={index} onClick={() => { updateLocalFilter("maxPrice", price); updateFilters("maxPrice", price); }}>£{price.toLocaleString()}</DropdownMenuItem>
                                                ) : null
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="max-w-40 hidden md:flex bg-white hover:bg-lightPink">
                            {!fils.minBedrooms && !fils.maxBedrooms ? "Num Bedrooms" :
                                `${fils.minBedrooms && !fils.maxBedrooms ? fils.minBedrooms + " beds min" : ""}
                            ${fils.minBedrooms && fils.maxBedrooms ? fils.minBedrooms + "-" + fils.maxBedrooms + " beds" : ""}
                            ${fils.maxBedrooms && !fils.minBedrooms ? fils.maxBedrooms + " beds max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                            {fils.minBedrooms ? fils.minBedrooms + " Bedrooms" : "Min Bedrooms"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("minBedrooms", null); updateFilters("minBedrooms", null); }}>No min</DropdownMenuItem>
                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                fils.maxBedrooms === null || (fils.maxBedrooms !== null && bed < fils.maxBedrooms) ? (
                                                    <DropdownMenuItem key={bed} onClick={() => { updateLocalFilter("minBedrooms", bed); updateFilters("minBedrooms", bed); }}>
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
                                            {fils.maxBedrooms ? fils.maxBedrooms + " Bedrooms" : "Max Bedrooms"} <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("maxBedrooms", null); updateFilters("maxBedrooms", null); }}>No max</DropdownMenuItem>
                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                fils.minBedrooms === null || (fils.minBedrooms !== null && bed > fils.minBedrooms) ? (
                                                    <DropdownMenuItem key={bed} onClick={() => { updateLocalFilter("maxBedrooms", bed); updateFilters("maxBedrooms", bed); }}>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="max-w-40 hidden lg:flex bg-white hover:bg-lightPink">
                            {!fils.minBathrooms && !fils.maxBathrooms ? "Num Bathrooms" :
                                `${fils.minBathrooms && !fils.maxBathrooms ? fils.minBathrooms + " baths min" : ""}
                            ${fils.minBathrooms && fils.maxBathrooms ? fils.minBathrooms + "-" + fils.maxBathrooms + " baths" : ""}
                            ${fils.maxBathrooms && !fils.minBathrooms ? fils.maxBathrooms + " baths max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                            {fils.minBathrooms ? fils.minBathrooms + " Bathrooms" : "Min Bathrooms"} <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("minBathrooms", null); updateFilters("minBathrooms", null); }}>No min</DropdownMenuItem>
                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                fils.maxBathrooms === null || (fils.maxBathrooms !== null && bath < fils.maxBathrooms) ? (
                                                    <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("minBathrooms", bath); updateFilters("minBathrooms", bath); }}>
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
                                            {fils.maxBathrooms ? fils.maxBathrooms + " Bathrooms" : "Max Bathrooms"} <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("maxBathrooms", null); updateFilters("maxBathrooms", null); }}>No max</DropdownMenuItem>
                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                fils.minBathrooms === null || (fils.minBathrooms !== null && bath > fils.minBathrooms) ? (
                                                    <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("maxBathrooms", bath); updateFilters("maxBathrooms", bath); }}>
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


                {/* Property Type */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="max-w-48 bg-white hover:bg-lightPink hidden lg:flex items-center justify-between gap-2"
                            variant="outline"
                        >
                            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                {fils.propertyTypes.length === 0 ? "All Property Types" : fils.propertyTypes.join(", ")}
                            </span>
                            <ChevronDown className="shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => { updateLocalFilter("propertyTypes", []); updateFilters("propertyTypes", []); }}>Show all</DropdownMenuItem>
                            {["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Land", "Commercial"].map((type) => (
                                <DropdownMenuItem key={type} onClick={() => {
                                    if (fils.propertyTypes.includes(type)) {
                                        updateLocalFilter("propertyTypes", fils.propertyTypes.filter((t) => t !== type));
                                        updateFilters("propertyTypes", fils.propertyTypes.filter((t) => t !== type));
                                    } else {
                                        updateLocalFilter("propertyTypes", [...fils.propertyTypes, type]);
                                        updateFilters("propertyTypes", [...fils.propertyTypes, type]);
                                    }
                                }}>
                                    <input type="checkbox" checked={fils.propertyTypes.includes(type)} readOnly className="mr-2" />
                                    {type}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="text-foreground cursor-pointer ml-auto" >
                    <Button
                        className="max-w-40 bg-white hover:bg-lightPink"
                        onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
                        variant={"outline"}
                    >
                        More Filters <ChevronDown />
                    </Button>
                </div>

                <FilterBarOverlay
                    isOpen={isMoreFiltersOpen}
                    onClose={() => setIsMoreFiltersOpen(false)}
                    filters={filters}
                    setFilters={setFilters}
                    allTags={allTags}
                    setAllTags={setAllTags}
                />
            </div>
        </div >
    );
}
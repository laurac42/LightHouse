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
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tag } from "@/types/tags";
import { fetchAllTags } from "@/lib/data/tag-utils";
import FilterBarOverlay from "@/components/filter-bar-overlay";
import type { Filters } from "@/types/filters";

type FilterBarProps = {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export default function FilterBar({ filters, setFilters }: FilterBarProps) {
    const [fils, setFils] = useState<Filters>(filters);
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState<boolean>(false);
    const [allTags, setAllTags] = useState<Tag[]>([]);

    const updateFilters = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

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
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-40 bg-white hover:bg-lightPink hidden sm:flex" variant="outline">{fils.milesRadius === null ? "This area only" : fils.milesRadius === 1 ? "Within 1 mile" : `Within ${fils.milesRadius} miles`}<ChevronDown /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => { updateLocalFilter("milesRadius", null); updateFilters("milesRadius", null); }}>This area only</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { updateLocalFilter("milesRadius", 1); updateFilters("milesRadius", 1); }}>Within 1 mile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { updateLocalFilter("milesRadius", 2); updateFilters("milesRadius", 2); }}>Within 2 miles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { updateLocalFilter("milesRadius", 5); updateFilters("milesRadius", 5); }}>Within 5 miles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { updateLocalFilter("milesRadius", 10); updateFilters("milesRadius", 10); }}>Within 10 miles</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-50 hidden sm:flex bg-white hover:bg-lightPink">
                            {!fils.minPrice && !fils.maxPrice ? "Price Range" :
                                `${fils.minPrice && !fils.maxPrice ? fils.minPrice + " min" : ""}
                            ${fils.minPrice && fils.maxPrice ? fils.minPrice + "-" + fils.maxPrice + " range" : ""}
                            ${fils.maxPrice && !fils.minPrice ? fils.maxPrice + " max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">{fils.minPrice ? fils.minPrice + " Price" : "Min Price"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel onClick={() => updateLocalFilter("minPrice", 100000)}>$100,000</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => updateLocalFilter("minPrice", 200000)}>$200,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateLocalFilter("minPrice", 300000)}>$300,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateLocalFilter("minPrice", 400000)}>$400,000</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">{fils.maxPrice ? fils.maxPrice + " Price" : "Max Price"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel onClick={() => updateLocalFilter("maxPrice", 100000)}>$100,000</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => updateLocalFilter("maxPrice", 200000)}>$200,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateLocalFilter("maxPrice", 300000)}>$300,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateLocalFilter("maxPrice", 400000)}>$400,000</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-40 hidden md:flex">
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
                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                <DropdownMenuLabel key={bed} onClick={() => updateLocalFilter("minBedrooms", bed)}>
                                                    {bed} Bed{index === 0 ? "" : "s"}
                                                </DropdownMenuLabel>
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
                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                <DropdownMenuLabel key={bed} onClick={() => updateLocalFilter("maxBedrooms", bed)}>
                                                    {bed} Bed{index === 0 ? "" : "s"}
                                                </DropdownMenuLabel>
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
                        <Button variant="outline" className="w-40 hidden lg:flex">
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
                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                <DropdownMenuLabel key={bath} onClick={() => updateLocalFilter("minBathrooms", bath)}>
                                                    {bath} Bath{index === 0 ? "" : "s"}
                                                </DropdownMenuLabel>
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
                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                <DropdownMenuLabel key={bath} onClick={() => updateLocalFilter("maxBathrooms", bath)}>
                                                    {bath} Bath{index === 0 ? "" : "s"}
                                                </DropdownMenuLabel>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
        </div>
    );
}
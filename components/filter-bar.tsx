import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { X, ChevronDown, Menu } from "lucide-react";
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

type FilterBarProps = {
    loc?: string;
    setLoc: React.Dispatch<React.SetStateAction<string>>;
}

export default function FilterBar({ loc = "", setLoc }: FilterBarProps) {
    const [location, setLocation] = useState<string>(loc);
    const [searchRadius, setSearchRadius] = useState<string>("This area only");
    const [minBedrooms, setMinBedrooms] = useState<string>("");
    const [maxBedrooms, setMaxBedrooms] = useState<string>("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [minBathrooms, setMinBathrooms] = useState<string>("");
    const [maxBathrooms, setMaxBathrooms] = useState<string>("");
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState<boolean>(false);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    useEffect(() => {
        setLocation(loc);
    }, [loc]);

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
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1 border-none"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setLoc((e.target as HTMLInputElement).value);
                                // set url params
                                const params = new URLSearchParams(window.location.search);
                                params.set("location", (e.target as HTMLInputElement).value);
                                window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                            }
                        }}
                    />
                    <InputGroupButton size="sm" className="text-md text-foreground bg-white hover:bg-lightPink md:w-10 h-full"><X /></InputGroupButton>
                </InputGroup>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-40 bg-white hover:bg-lightPink hidden sm:flex" variant="outline">{searchRadius}<ChevronDown /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel onClick={() => setSearchRadius("This area only")}>This area only</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSearchRadius("Within 1 mile")}>Within 1 mile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchRadius("Within 2 miles")}>Within 2 miles</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-50 hidden sm:flex bg-white hover:bg-lightPink">
                            {!minPrice && !maxPrice ? "Price Range" :
                                `${minPrice && !maxPrice ? minPrice + " min" : ""}
                            ${minPrice && maxPrice ? minPrice + "-" + maxPrice + " range" : ""}
                            ${maxPrice && !minPrice ? maxPrice + " max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">{minPrice ? minPrice + " Price" : "Min Price"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel onClick={() => setMinPrice("100000")}>$100,000</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setMinPrice("200000")}>$200,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinPrice("300000")}>$300,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinPrice("400000")}>$400,000</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">{maxPrice ? maxPrice + " Price" : "Max Price"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel onClick={() => setMaxPrice("100000")}>$100,000</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setMaxPrice("200000")}>$200,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxPrice("300000")}>$300,000</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxPrice("400000")}>$400,000</DropdownMenuItem>
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
                            {!minBedrooms && !maxBedrooms ? "Num Bedrooms" :
                                `${minBedrooms && !maxBedrooms ? minBedrooms + " beds min" : ""}
                            ${minBedrooms && maxBedrooms ? minBedrooms + "-" + maxBedrooms + " beds" : ""}
                            ${maxBedrooms && !minBedrooms ? maxBedrooms + " beds max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                            {minBedrooms ? minBedrooms + " Bedrooms" : "Min Bedrooms"} <ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                <DropdownMenuLabel key={bed} onClick={() => setMinBedrooms(bed.toString())}>
                                                    {bed} Bed{index === 0 ? "" : "s"}
                                                </DropdownMenuLabel>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                            {maxBedrooms ? maxBedrooms + " Bedrooms" : "Max Bedrooms"} <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                <DropdownMenuLabel key={bed} onClick={() => setMaxBedrooms(bed.toString())}>
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
                            {!minBathrooms && !maxBathrooms ? "Num Bathrooms" :
                                `${minBathrooms && !maxBathrooms ? minBathrooms + " baths min" : ""}
                            ${minBathrooms && maxBathrooms ? minBathrooms + "-" + maxBathrooms + " baths" : ""}
                            ${maxBathrooms && !minBathrooms ? maxBathrooms + " baths max" : ""}`}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <div className="flex flex-row gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                            {minBathrooms ? minBathrooms + " Bathrooms" : "Min Bathrooms"} <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                <DropdownMenuLabel key={bath} onClick={() => setMinBathrooms(bath.toString())}>
                                                    {bath} Bath{index === 0 ? "" : "s"}
                                                </DropdownMenuLabel>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white hover:bg-lightPink">
                                            {maxBathrooms ? maxBathrooms + " Bathrooms" : "Max Bathrooms"} <ChevronDown />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                <DropdownMenuLabel key={bath} onClick={() => setMaxBathrooms(bath.toString())}>
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
                    <Button className="w-40 bg-white hover:bg-lightPink" onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)} variant={"outline"}>
                        More Filters <ChevronDown />
                    </Button>
                </div>

                {/* Filter Bar Overlay */}
                {isMoreFiltersOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[101]" onClick={() => setIsMoreFiltersOpen(false)} />
                )}
                {isMoreFiltersOpen && (
                    <div className="fixed top-0 right-0 h-screen w-1/2 lg:w-1/3 bg-navBar flex flex-col space-y-4 p-6 z-[102] shadow-lg overflow-y-auto">
                        <div className="flex flex-row items-center mb-4 gap-4">
                            <div className="flex flex-row items-center">
                                <p className="text-lg font-bold">More Filters</p>
                            </div>
                            <Button variant="ghost" className="hover:bg-transparent" onClick={() => setIsMoreFiltersOpen(false)}>
                                <X className="size-6" />
                            </Button>
                        </div>

                        {/* Tag prioritisation - allow users to select tags to prioritise in search results */}
                        <div>
                            <h3 className="text-lg font-bold mb-2">Prioritise by Tag</h3>
                            {selectedTags.length > 0 && (
                                <>
                                    <h3 className="text-md font-semibold mb-2">Selected Tags</h3>
                                    <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto mb-2">
                                        {selectedTags.map((tag) => (
                                            <Button
                                                key={tag.id}
                                                variant={"outline"}
                                                className="inline-block bg-yellow hover:bg-yellowHover text-foreground text-xs px-2 py-1 rounded-xl mr-2 mb-2"
                                                onClick={() => {
                                                    allTags.push(tag);
                                                    setSelectedTags(selectedTags.filter(t => t.id !== tag.id))
                                                }}
                                            >
                                                {tag.name}
                                            </Button>
                                        ))}
                                    </div>
                                </>
                            )}
                            {allTags.length > 0 && (
                                <>
                                    <h3 className="text-md font-semibold mb-2">All Tags</h3>
                                    <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                                        {allTags.map((tag) => (
                                            <Button
                                                key={tag.id}
                                                variant={"outline"}
                                                className="inline-block bg-buttonColor hover:bg-buttonHover text-foreground text-xs px-2 py-1 rounded-xl mr-2 mb-2"
                                                onClick={() => {
                                                    selectedTags.push(tag);
                                                    setAllTags(allTags.filter(t => t.id !== tag.id));
                                                }}
                                            >
                                                {tag.name}
                                            </Button>
                                        ))}

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
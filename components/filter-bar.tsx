import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { X, ChevronDown, Menu } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FilterBar() {
    const [location, setLocation] = useState<string>("");
    const [searchRadius, setSearchRadius] = useState<string>("This area only");
    const [minBedrooms, setMinBedrooms] = useState<string>("");
    const [maxBedrooms, setMaxBedrooms] = useState<string>("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [minBathrooms, setMinBathrooms] = useState<string>("");
    const [maxBathrooms, setMaxBathrooms] = useState<string>("");
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState<boolean>(false);
    return (
        <div className="w-full bg-highlight p-4 shadow-sm shadow-highlight">
            <div className="flex flex-row gap-3">
                <InputGroup className="border border-foreground flex flex-1 bg-white ">
                    <InputGroupInput
                        placeholder="e.g. Dundee, Monifieth ..."
                        value={"Dundee"}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1 border-none"
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
                                        <Button  variant="outline" className="bg-white hover:bg-lightPink">{minPrice ? minPrice + " Price" : "Min Price"} <ChevronDown /></Button>
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
                                            <DropdownMenuLabel onClick={() => setMinBedrooms("1")}>1 Bed</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setMinBedrooms("2")}>2 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBedrooms("3")}>3 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBedrooms("4")}>4 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBedrooms("5")}>5 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBedrooms("6")}>6 Beds</DropdownMenuItem>
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
                                            <DropdownMenuLabel onClick={() => setMaxBedrooms("1")}>1 Bed</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setMaxBedrooms("2")}>2 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBedrooms("3")}>3 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBedrooms("4")}>4 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBedrooms("5")}>5 Beds</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBedrooms("6")}>6 Beds</DropdownMenuItem>
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
                                            <DropdownMenuLabel onClick={() => setMinBathrooms("1")}>1 Bath</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setMinBathrooms("2")}>2 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBathrooms("3")}>3 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBathrooms("4")}>4 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBathrooms("5")}>5 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMinBathrooms("6")}>6 Baths</DropdownMenuItem>
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
                                            <DropdownMenuLabel onClick={() => setMaxBathrooms("1")}>1 Bath</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setMaxBathrooms("2")}>2 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBathrooms("3")}>3 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBathrooms("4")}>4 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBathrooms("5")}>5 Baths</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMaxBathrooms("6")}>6 Baths</DropdownMenuItem>
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
                {/* Mobile Menu Overlay */}
                {isMoreFiltersOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMoreFiltersOpen(false)} />
                )}
                {isMoreFiltersOpen && (
                    <div className="fixed top-0 right-0 h-screen w-1/2 md:w-1/3 bg-navBar flex flex-col space-y-4 p-6 z-50 shadow-lg overflow-y-auto">
                        <div className="flex flex-row items-center mb-6 gap-4">
                            <div className="flex flex-row items-center">
                                <p className="text-lg font-bold">More Filters</p>
                            </div>
                            <X onClick={() => setIsMoreFiltersOpen(false)} />
                        </div>
                        <a href="#" className="text-foreground text-lg">One</a>
                        <a href="#" className="text-foreground text-lg">Two</a>
                        <a href="#" className="text-foreground text-lg">Three</a>
                        <a href="#" className="text-foreground text-lg">Four</a>
                    </div>
                )}


            </div>
        </div>
    );
}
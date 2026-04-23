import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Tag } from "@/types/tags";
import { useEffect, useState } from "react";
import type { Filters } from "@/types/filters";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { useRouter, useSearchParams } from "next/navigation";
import { UserLocation } from "@/types/address";
import { Label } from "@radix-ui/react-dropdown-menu";
import { DEFAULT_FILTERS, parseFiltersFromSearchParams } from "@/lib/filters/url-filters";

type FilterBarOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    allTags: Tag[];
    setAllTags: React.Dispatch<React.SetStateAction<Tag[]>>;
    locations?: UserLocation[] | null;
    onLocationSaved?: () => void;
    showDistanceFromLocation?: UserLocation[];
    setShowDistanceFromLocation?: (locations: UserLocation[]) => void;
}

export default function FilterBarOverlay({
    isOpen,
    onClose,
    allTags,
    setAllTags,
    locations,
    onLocationSaved,
    showDistanceFromLocation,
    setShowDistanceFromLocation
}: FilterBarOverlayProps) {

    const searchParams = useSearchParams();
    const router = useRouter();

    const [localFilters, setLocalFilters] = useState<Filters>(DEFAULT_FILTERS);

    // load search parameter filters
    useEffect(() => {
        parseFiltersFromSearchParams(searchParams).then(setLocalFilters);
    }, [searchParams]);

    // load local storage filters every time the component is opened
    useEffect(() => {
        const storedUserLocationsAndDistances = localStorage.getItem("userLocationsAndDistances");
        if (storedUserLocationsAndDistances) {
            setLocalFilters((prev) => ({
                ...prev,
                userLocationsAndDistances: JSON.parse(storedUserLocationsAndDistances),
            }));
        }
    }, [isOpen]);


    const updateLocalFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    if (!isOpen) return null;

    return (
        <>
            <div>
                <div className="fixed inset-0 bg-black/50 z-[101]" onClick={onClose} />
                <div className="fixed top-0 right-0 h-screen w-4/5 lg:w-3/4 bg-navBar flex flex-col p-6 z-[102] shadow-lg">
                    <div className="flex flex-row items-center mb-4 justify-between">
                        <div className="flex flex-row items-center">
                            <p className="text-lg font-bold">More Filters</p>
                        </div>
                        <Button variant="ghost" className="hover:bg-transparent" onClick={onClose}>
                            <X className="size-6" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">

                        <div className="flex flex-col gap-4 pb-4 mx-0 sm:mx-4 md:mx-8 lg:mx-12">

                            {locations && locations.length > 0 &&
                                <div className="mt-2 mb-4 flex flex-wrap gap-3git">
                                    <p className="whitespace-nowrap">Show distance from: </p>
                                    <FieldGroup className="flex flex-row flex-wrap">
                                        {locations?.map((location, index) => (
                                            <Field orientation="horizontal" key={index} className="w-auto">
                                                <Checkbox className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight" id={`${index}-checkbox`} name={`${index}-checkbox`} checked={showDistanceFromLocation?.includes(location) ?? false} onCheckedChange={(checked) => {
                                                    if (checked === true && setShowDistanceFromLocation) {
                                                        setShowDistanceFromLocation([...(showDistanceFromLocation ?? []), location]);
                                                    } else if (checked === false && setShowDistanceFromLocation) {
                                                        setShowDistanceFromLocation((showDistanceFromLocation ?? []).filter((l) => l !== location));
                                                    }
                                                }} />
                                                <FieldLabel htmlFor={`${index}-checkbox`} className="font-normal">
                                                    {location.nickname}
                                                </FieldLabel>
                                            </Field>
                                        ))}
                                    </FieldGroup>
                                </div>
                            }

                            {/** Search Radius */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Search Radius</DropdownMenuLabel>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button type="button" className="w-50 bg-white hover:bg-lightPink" variant="outline">{localFilters.milesRadius === null ? "This area only" : localFilters.milesRadius === 1 ? "Within 1 mile" : `Within ${localFilters.milesRadius} miles`}<ChevronDown /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="z-[104]">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", null); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>This area only</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 1); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 1 mile</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 2); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 2 miles</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 5); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 5 miles</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 10); } else { toast.error("Select a location to add a search radius", { position: "top-right" }) } }}>Within 10 miles</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <hr />

                            {/** Price Range */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Price Range</DropdownMenuLabel>
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">{localFilters.minPrice ? "£" + localFilters.minPrice.toLocaleString() : "Min Price"} <ChevronDown /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("minPrice", null); }}>No Min</DropdownMenuItem>
                                                {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                    localFilters.maxPrice === null || (localFilters.maxPrice !== null && price < localFilters.maxPrice) ? (
                                                        <DropdownMenuItem key={index} onClick={() => updateLocalFilter("minPrice", price)}>£{price.toLocaleString()}</DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">{localFilters.maxPrice ? "£" + localFilters.maxPrice.toLocaleString() : "Max Price"} <ChevronDown /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("maxPrice", null); }}>No max</DropdownMenuItem>
                                                {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000].map((price, index) => (
                                                    localFilters.minPrice === null || (localFilters.minPrice !== null && price > localFilters.minPrice) ? (
                                                        <DropdownMenuItem key={index} onClick={() => updateLocalFilter("maxPrice", price)}>£{price.toLocaleString()}</DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <hr />

                            {/** Num bedrooms */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Number of Bedrooms</DropdownMenuLabel>
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.minBedrooms ? localFilters.minBedrooms : "Min"} <ChevronDown /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("minBedrooms", null); }}>No min</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                    localFilters.maxBedrooms === null || (localFilters.maxBedrooms !== null && bed < localFilters.maxBedrooms) ? (
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
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.maxBedrooms ? localFilters.maxBedrooms : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("maxBedrooms", null); }}>No max</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bed, index) => (
                                                    localFilters.minBedrooms === null || (localFilters.minBedrooms !== null && bed > localFilters.minBedrooms) ? (
                                                        <DropdownMenuItem key={bed} onClick={() => updateLocalFilter("maxBedrooms", bed)}>
                                                            {bed} Bed{index === 0 ? "" : "s"}
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">Bedrooms</p>
                                </div>
                            </div>

                            <hr />
                            {/** Num bathrooms */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Number of Bathrooms</DropdownMenuLabel>
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.minBathrooms ? localFilters.minBathrooms : "Min"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("minBathrooms", null); }}>No min</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                    localFilters.maxBathrooms === null || (localFilters.maxBathrooms !== null && bath < localFilters.maxBathrooms) ? (
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
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.maxBathrooms ? localFilters.maxBathrooms : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("maxBathrooms", null); }}>No max</DropdownMenuItem>
                                                {[1, 2, 3, 4, 5, 6].map((bath, index) => (
                                                    localFilters.minBathrooms === null || (localFilters.minBathrooms !== null && bath > localFilters.minBathrooms) ? (
                                                        <DropdownMenuItem key={bath} onClick={() => { updateLocalFilter("maxBathrooms", bath); }}>
                                                            {bath} Bathroom{index === 0 ? "" : "s"}
                                                        </DropdownMenuItem>
                                                    ) : null))
                                                }
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">Bathrooms</p>
                                </div>
                            </div>

                            <hr />

                            {/* Property Type */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Property Type</DropdownMenuLabel>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="max-w-full bg-white hover:bg-lightPink items-center justify-between gap-2"
                                            variant="outline"
                                        >
                                            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                                {localFilters.propertyTypes.length === 0 ? "All Property Types" : localFilters.propertyTypes.join(", ")}
                                            </span>
                                            <ChevronDown className="shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="z-[104]">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { updateLocalFilter("propertyTypes", []); }}>Show all</DropdownMenuItem>
                                            {["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Land", "Commercial"].map((type) => (
                                                <DropdownMenuItem key={type} onClick={(e) => {
                                                    e.preventDefault();
                                                    if (localFilters.propertyTypes.includes(type)) {
                                                        updateLocalFilter("propertyTypes", localFilters.propertyTypes.filter((t) => t !== type));
                                                    } else {
                                                        updateLocalFilter("propertyTypes", [...localFilters.propertyTypes, type]);
                                                    }
                                                }}>
                                                    <input type="checkbox" checked={localFilters.propertyTypes.includes(type)} readOnly className="mr-2" />
                                                    {type}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Location selection */}

                            {locations && locations.length > 0 && (
                                <>
                                    <hr />
                                    <Label className="text-lg font-bold">Distance from your Locations</Label>
                                    <div className="flex flex-wrap gap-6">
                                        {locations.map((location) => (
                                            <div key={location.id}>
                                                <DropdownMenuLabel className="text-md font-bold">{location.nickname}</DropdownMenuLabel>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" className="w-50 bg-white hover:bg-lightPink" variant="outline">{localFilters.userLocationsAndDistances?.find(ld => ld.location.id === location.id)?.distance === null || localFilters.userLocationsAndDistances?.find(ld => ld.location.id === location.id)?.distance === undefined ? "Any Distance " : localFilters.userLocationsAndDistances?.find(ld => ld.location.id === location.id)?.distance === 1 ? "Within 1 mile" : `Within ${localFilters.userLocationsAndDistances?.find(ld => ld.location.id === location.id)?.distance} miles`}<ChevronDown /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="z-[104]">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: null }])}>Any Distance</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: 1 }])}>Within 1 mile</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: 2 }])}>Within 2 miles</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: 5 }])}>Within 5 miles</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: 10 }])}>Within 10 miles</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: 20 }])}>Within 20 miles</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateLocalFilter("userLocationsAndDistances", [...localFilters.userLocationsAndDistances.filter(ld => ld.location.id !== location.id), { location, distance: 30 }])}>Within 30 miles</DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <hr />

                            {/* Tag prioritisation - allow users to select tags to prioritise in search results */}
                            <div>
                                <h3 className="text-lg font-bold mb-2">Prioritise by Tag</h3>

                                {localFilters.selectedTags.length > 0 &&
                                    <h3 className="text-md font-semibold mb-2">Selected Tags</h3>
                                }
                                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto mb-2">
                                    {localFilters.selectedTags.map((tag) => (
                                        <Button
                                            key={tag.id}
                                            variant={"outline"}
                                            className="inline-block bg-yellow hover:bg-yellowHover text-foreground text-xs px-2 py-1 rounded-xl mr-2 mb-2"
                                            onClick={() => {
                                                setAllTags([...allTags, tag]);
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    selectedTags: prev.selectedTags.filter((t) => t.id !== tag.id),
                                                }));
                                            }}
                                        >
                                            {tag.name}
                                        </Button>
                                    ))}
                                </div>

                                {allTags.length > 0 && (
                                    <>
                                        <h3 className="text-md font-semibold">All Tags</h3>
                                        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                                            {allTags.map((tag) => (
                                                <Button
                                                    key={tag.id}
                                                    variant={"outline"}
                                                    className="inline-block bg-buttonColor hover:bg-buttonHover text-foreground text-xs px-2 py-1 rounded-xl mr-2 mb-2"
                                                    onClick={() => {
                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            selectedTags: [...prev.selectedTags, tag],
                                                        }));
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

                            <hr />
                            {/* Has a: garden, garage, driveway, new_build */}
                            <div>
                                <FieldSet>
                                    <FieldLegend variant="label">
                                        <h3 className="text-lg font-bold mb-2">Must Have</h3>
                                    </FieldLegend>
                                    <FieldGroup className="flex md:flex-row gap-3">
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="garage"
                                                name="garage"
                                                checked={localFilters.garage === true}
                                                onCheckedChange={() => updateLocalFilter("garage", localFilters.garage ? null : true)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="garage"
                                                className="font-normal text-md"
                                            >
                                                Garage
                                            </FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="driveway"
                                                name="driveway"
                                                checked={localFilters.driveway === true}
                                                onCheckedChange={() => updateLocalFilter("driveway", localFilters.driveway ? null : true)}
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
                                                checked={localFilters.garden === true}
                                                onCheckedChange={() => updateLocalFilter("garden", localFilters.garden ? null : true)}
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
                                                checked={localFilters.new_build === true}
                                                onCheckedChange={() => updateLocalFilter("new_build", localFilters.new_build ? null : true)}
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

                            <hr />

                            {/* Square feet */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Square Feet</DropdownMenuLabel>
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.min_sqft ? localFilters.min_sqft : "Min"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("min_sqft", null); }}>No min</DropdownMenuItem>
                                                {[500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000].map((sqft, index) => (
                                                    localFilters.max_sqft === null || (localFilters.max_sqft !== null && sqft < localFilters.max_sqft) ? (
                                                        <DropdownMenuItem key={sqft} onClick={() => { updateLocalFilter("min_sqft", sqft); }}>
                                                            {sqft} sqft
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.max_sqft ? localFilters.max_sqft : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("max_sqft", null); }}>No max</DropdownMenuItem>
                                                {[500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000].map((sqft, index) => (
                                                    localFilters.min_sqft === null || (localFilters.min_sqft !== null && sqft > localFilters.min_sqft) ? (
                                                        <DropdownMenuItem key={sqft} onClick={() => { updateLocalFilter("max_sqft", sqft); }}>
                                                            {sqft} sqft
                                                        </DropdownMenuItem>
                                                    ) : null))
                                                }
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">Square Feet</p>
                                </div>
                            </div>
                            <hr />

                            {/* Council Tax */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Council Tax Band</DropdownMenuLabel>
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.min_council_tax_band ? localFilters.min_council_tax_band : "Min"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("min_council_tax_band", null); }}>No min</DropdownMenuItem>
                                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((band, index) => (
                                                    localFilters.max_council_tax_band === null || (localFilters.max_council_tax_band !== null && band < localFilters.max_council_tax_band) ? (
                                                        <DropdownMenuItem key={band} onClick={() => { updateLocalFilter("min_council_tax_band", band); }}>
                                                            {band}
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.max_council_tax_band ? localFilters.max_council_tax_band : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("max_council_tax_band", null); }}>No max</DropdownMenuItem>
                                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((band, index) => (
                                                    localFilters.min_council_tax_band === null || (localFilters.min_council_tax_band !== null && band > localFilters.min_council_tax_band) ? (
                                                        <DropdownMenuItem key={band} onClick={() => { updateLocalFilter("max_council_tax_band", band); }}>
                                                            {band}
                                                        </DropdownMenuItem>
                                                    ) : null))
                                                }
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <hr />

                            {/* EPC Rating */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">EPC Rating</DropdownMenuLabel>
                                <div className="flex flex-row gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.min_epc_rating ? localFilters.min_epc_rating : "Min"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("min_epc_rating", null); }}>No min</DropdownMenuItem>
                                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rating) => (
                                                    localFilters.max_epc_rating === null || (localFilters.max_epc_rating !== null && rating < localFilters.max_epc_rating) ? (
                                                        <DropdownMenuItem key={rating} onClick={() => { updateLocalFilter("min_epc_rating", rating); }}>
                                                            {rating}
                                                        </DropdownMenuItem>
                                                    ) : null
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <p className="my-auto">to</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white hover:bg-lightPink">
                                                {localFilters.max_epc_rating ? localFilters.max_epc_rating : "Max"} <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[104]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { updateLocalFilter("max_epc_rating", null); }}>No max</DropdownMenuItem>
                                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rating) => (
                                                    localFilters.min_epc_rating === null || (localFilters.min_epc_rating !== null && rating > localFilters.min_epc_rating) ? (
                                                        <DropdownMenuItem key={rating} onClick={() => { updateLocalFilter("max_epc_rating", rating); }}>
                                                            {rating}
                                                        </DropdownMenuItem>
                                                    ) : null))
                                                }
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <hr />

                            {/* Include new builds and under offer */}
                            <div>
                                <FieldSet>
                                    <FieldLegend variant="label">
                                        <h3 className="text-lg font-bold mb-2">Include</h3>
                                    </FieldLegend>
                                    <FieldGroup className="flex md:flex-row gap-3">
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="under_offer"
                                                name="under_offer"
                                                checked={localFilters.include_under_offer === true}
                                                onCheckedChange={() => updateLocalFilter("include_under_offer", !localFilters.include_under_offer)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="under_offer"
                                                className="font-normal"
                                            >
                                                Under Offer
                                            </FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="include_new_build"
                                                name="new_build"
                                                checked={localFilters.include_new_builds === true}
                                                onCheckedChange={() => updateLocalFilter("include_new_builds", !localFilters.include_new_builds)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="include_new_build"
                                                className="font-normal"
                                            >
                                                New Builds
                                            </FieldLabel>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </div>

                            <hr />


                        </div>
                    </div>

                    <div className="z-[103] h-10 mb-6 sm:mb-2 mt-2 bg-navBar flex justify-between items-center w-full px-4">
                        <Button variant={"link"} className="mx-4" onClick={() => {

                            setAllTags([...allTags, ...localFilters.selectedTags]);
                            setLocalFilters((prev) => ({
                                ...prev,
                                selectedTags: [],
                                propertyTypes: [],
                                minBedrooms: null,
                                maxBedrooms: null,
                                minBathrooms: null,
                                maxBathrooms: null,
                                minPrice: null,
                                maxPrice: null,
                                milesRadius: null,
                                garage: null,
                                driveway: null,
                                garden: null,
                                new_build: null,
                                min_sqft: null,
                                max_sqft: null,
                                min_epc_rating: null,
                                max_epc_rating: null,
                                min_council_tax_band: null,
                                max_council_tax_band: null,
                                include_under_offer: true,
                                include_new_builds: true,
                                userLocationsAndDistances: localFilters.userLocationsAndDistances.map(ld => ({ location: ld.location, distance: null })),
                            }));
                        }}>
                            Clear All
                        </Button>
                        <Button onClick={() => {
                            const updated = { ...localFilters };

                            // set url params
                            const params = new URLSearchParams();

                            const setOrDelete = (key: string, value: any) => {
                                if (key === "include_under_offer" || key === "include_new_builds") {
                                    // these should only be included if false, as true is the default
                                    if (value === false) {
                                        params.set(String(key), String(value))
                                    } else {
                                        params.delete(String(key))
                                    }
                                    return;
                                }
                                if (key === "propertyTypes" && Array.isArray(value) && value.length === 0) {
                                    params.delete(String(key))
                                    return;
                                }
                                if (value === null || value === undefined || value === "") {
                                    params.delete(String(key))
                                } else {
                                    params.set(String(key), String(value))
                                }
                            }

                            // store user locations in local storage, as they are user-specific, not for url
                            const updatedUserLocations = updated.userLocationsAndDistances.filter(ld => ld.distance !== null);
                            localStorage.setItem("userLocationsAndDistances", JSON.stringify(updatedUserLocations));
                            onLocationSaved?.();

                            setOrDelete("location", updated.location);
                            setOrDelete("milesRadius", updated.milesRadius);
                            setOrDelete("minPrice", updated.minPrice);
                            setOrDelete("maxPrice", updated.maxPrice);
                            setOrDelete("minBedrooms", updated.minBedrooms);
                            setOrDelete("maxBedrooms", updated.maxBedrooms);
                            setOrDelete("minBathrooms", updated.minBathrooms);
                            setOrDelete("maxBathrooms", updated.maxBathrooms);
                            setOrDelete("propertyTypes", updated.propertyTypes);
                            setOrDelete("garage", updated.garage);
                            setOrDelete("garden", updated.garden);
                            setOrDelete("driveway", updated.driveway);
                            setOrDelete("new_build", updated.new_build);
                            setOrDelete("min_sqft", updated.min_sqft);
                            setOrDelete("max_sqft", updated.max_sqft);
                            setOrDelete("min_epc_rating", updated.min_epc_rating);
                            setOrDelete("max_epc_rating", updated.max_epc_rating);
                            setOrDelete("min_council_tax_band", updated.min_council_tax_band);
                            setOrDelete("max_council_tax_band", updated.max_council_tax_band);
                            setOrDelete("include_under_offer", updated.include_under_offer);
                            setOrDelete("include_new_builds", updated.include_new_builds);
                            setOrDelete("selectedTags", updated.selectedTags.map(tag => tag.id).join(","));

                            router.replace(`?${params.toString()}`);

                            onClose();

                        }} className="bg-highlight hover:bg-highlight/90 text-white mx-6">
                            Apply Filters
                        </Button>
                    </div>

                </div >

            </div >

        </>
    );
}

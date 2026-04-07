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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"

type FilterBarOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    allTags: Tag[];
    setAllTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

export default function FilterBarOverlay({
    isOpen,
    onClose,
    filters,
    setFilters,
    allTags,
    setAllTags,
}: FilterBarOverlayProps) {

    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

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

                            {/* Property Type */}
                            <div>
                                <DropdownMenuLabel className="text-lg font-bold">Property Type</DropdownMenuLabel>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="max-w-full bg-white hover:bg-lightPink hidden lg:flex items-center justify-between gap-2"
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
                                                <DropdownMenuItem key={type} onClick={() => {
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
                            {/* Has a: garden, garage, driveway */}
                            <div>
                                <FieldSet>
                                    <FieldLegend variant="label">
                                        <h3 className="text-lg font-bold mb-2">Show only properties with a: </h3>
                                    </FieldLegend>
                                    <FieldGroup className="flex flex-row gap-3">
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="garage"
                                                name="garage"
                                                checked={localFilters.garage === true}
                                                onCheckedChange={() => updateLocalFilter("garage", !localFilters.garage)}
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
                                                checked={localFilters.driveway === true}
                                                onCheckedChange={() => updateLocalFilter("driveway", !localFilters.driveway)}
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
                                                onCheckedChange={() => updateLocalFilter("garden", !localFilters.garden)}
                                                className="border border-2 border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                                            />
                                            <FieldLabel
                                                htmlFor="garden"
                                                className="font-normal"
                                            >
                                                Garden
                                            </FieldLabel>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </div>
                        </div>
                    </div>

                    <div className="z-[103] h-10 mt-2 bg-navBar flex justify-between items-center w-full px-4">
                        <Button variant={"link"} className="mx-4" onClick={() => {
                            setAllTags([...allTags, ...localFilters.selectedTags]);
                            setLocalFilters((prev) => ({
                                ...prev,
                                selectedTags: [],
                                minBedrooms: null,
                                maxBedrooms: null,
                                minBathrooms: null,
                                maxBathrooms: null,
                                minPrice: null,
                                maxPrice: null,
                                milesRadius: null,
                            }));
                        }}>
                            Clear All
                        </Button>
                        <Button onClick={() => {
                            setFilters((prev) => ({ ...prev, ...localFilters }));
                            onClose();
                        }} className="bg-highlight hover:bg-highlight/90 text-white mx-6">
                            Apply Filters
                        </Button>
                    </div>

                </div>

            </div >

        </>
    );
}

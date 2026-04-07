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
import { toast } from "sonner";

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
                <div className="fixed top-0 right-0 h-screen w-3/4 lg:w-1/2 bg-navBar flex flex-col p-6 z-[102] shadow-lg">
                    <div className="flex flex-row items-center mb-4 justify-between">
                        <div className="flex flex-row items-center">
                            <p className="text-lg font-bold">More Filters</p>
                        </div>
                        <Button variant="ghost" className="hover:bg-transparent" onClick={onClose}>
                            <X className="size-6" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">

                        <div className="flex flex-col gap-4 pb-4">
                        <hr  className="sm:hidden" />
                        <div className="sm:hidden">
                            <DropdownMenuLabel className="text-lg font-bold">Search Radius</DropdownMenuLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" className="w-40 bg-white hover:bg-lightPink" variant="outline">{localFilters.milesRadius === null ? "This area only" : localFilters.milesRadius === 1 ? "Within 1 mile" : `Within ${localFilters.milesRadius} miles`}<ChevronDown /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="z-[104]">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", null); } else { toast.error("Select a location to add a search radius", {position: "top-right"}) } }}>This area only</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 1); } else { toast.error("Select a location to add a search radius", {position: "top-right"}) } }}>Within 1 mile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 2); } else { toast.error("Select a location to add a search radius", {position: "top-right"}) } }}>Within 2 miles</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 5); } else { toast.error("Select a location to add a search radius", {position: "top-right"}) } }}>Within 5 miles</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (localFilters.location) { updateLocalFilter("milesRadius", 10); } else { toast.error("Select a location to add a search radius", {position: "top-right"}) } }}>Within 10 miles</DropdownMenuItem>
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
                                    <h3 className="text-md font-semibold mb-2">All Tags</h3>
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
                        </div>
                    </div>

                    <div className="z-[103] h-10 mt-2 bg-navBar flex justify-between items-center w-full px-4">
                            <Button variant={"link"} className="mx-4" onClick={() => {
                                setAllTags([...allTags, ...localFilters.selectedTags]);
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    selectedTags: [],
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

            </div>

        </>
    );
}

import type { Tag } from "@/types/tags";

export interface Filters {
    location: string;
    selectedTags: Tag[];
    milesRadius: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    minBedrooms: number | null;
    maxBedrooms: number | null;
    minBathrooms: number | null;
    maxBathrooms: number | null;
    propertyTypes: string[];
    garage: boolean | null;
    garden: boolean | null;
    driveway: boolean | null;
    new_build: boolean | null;
}
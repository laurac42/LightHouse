import type { Tag } from "@/types/tags";
import { UserLocation } from "./address";

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
    min_sqft: number | null;
    max_sqft: number | null;
    min_epc_rating: string | null;
    max_epc_rating: string | null;
    min_council_tax_band: string | null;
    max_council_tax_band: string | null;
    include_under_offer: boolean;
    include_new_builds: boolean;
    userLocationsAndDistances: { location: UserLocation; distance: number | null  }[]; // user locations and distance
}
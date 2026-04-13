import type { Filters } from "@/types/filters";

type SearchParamReader = {
    get: (key: string) => string | null;
};

export const DEFAULT_FILTERS: Filters = {
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
    userLocationsAndDistances: [],
};

export function parseFiltersFromSearchParams(params: SearchParamReader): Filters {
    const location = params.get("location");
    const milesRadiusParam = params.get("milesRadius");
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const minBedroomsParam = params.get("minBedrooms");
    const maxBedroomsParam = params.get("maxBedrooms");
    const minBathroomsParam = params.get("minBathrooms");
    const maxBathroomsParam = params.get("maxBathrooms");
    const propertyTypesParam = params.get("propertyTypes");
    const garageParam = params.get("garage");
    const gardenParam = params.get("garden");
    const drivewayParam = params.get("driveway");
    const newBuildParam = params.get("new_build");
    const minSqftParam = params.get("min_sqft");
    const maxSqftParam = params.get("max_sqft");
    const minEpcRatingParam = params.get("min_epc_rating");
    const maxEpcRatingParam = params.get("max_epc_rating");
    const minCouncilTaxBandParam = params.get("min_council_tax_band");
    const maxCouncilTaxBandParam = params.get("max_council_tax_band");
    const includeUnderOfferParam = params.get("include_under_offer");
    const includeNewBuildsParam = params.get("include_new_builds");

    return {
        ...DEFAULT_FILTERS,
        location: location || "",
        milesRadius: milesRadiusParam ? parseInt(milesRadiusParam) : null,
        minPrice: minPriceParam ? parseInt(minPriceParam) : null,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam) : null,
        minBedrooms: minBedroomsParam ? parseInt(minBedroomsParam) : null,
        maxBedrooms: maxBedroomsParam ? parseInt(maxBedroomsParam) : null,
        minBathrooms: minBathroomsParam ? parseInt(minBathroomsParam) : null,
        maxBathrooms: maxBathroomsParam ? parseInt(maxBathroomsParam) : null,
        propertyTypes: propertyTypesParam ? propertyTypesParam.split(",") : [],
        garage: garageParam ? garageParam === "true" : null,
        garden: gardenParam ? gardenParam === "true" : null,
        driveway: drivewayParam ? drivewayParam === "true" : null,
        new_build: newBuildParam ? newBuildParam === "true" : null,
        min_sqft: minSqftParam ? parseInt(minSqftParam) : null,
        max_sqft: maxSqftParam ? parseInt(maxSqftParam) : null,
        min_epc_rating: minEpcRatingParam || null,
        max_epc_rating: maxEpcRatingParam || null,
        min_council_tax_band: minCouncilTaxBandParam || null,
        max_council_tax_band: maxCouncilTaxBandParam || null,
        include_under_offer: includeUnderOfferParam ? includeUnderOfferParam === "false" : true,
        include_new_builds: includeNewBuildsParam ? includeNewBuildsParam === "false" : true,
    };
}

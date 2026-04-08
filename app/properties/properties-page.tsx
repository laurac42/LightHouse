"use client";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Database } from "@/types/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/property-card";
import { getImagesFromStorage } from "@/lib/data/images";
import { createClient } from "@/lib/supabase/client";
import { fetchFavourites } from "@/lib/data/favourites";
import { fetchPropertiesForPage } from "@/lib/data/property-utils";
import { fetchUserPreferences } from "@/lib/data/buyer-profile";
import { UserPreferences } from "@/types/user";
import { getPolygonBoundingBoxForLocation } from "@/lib/data/location";
import type { BoundingBox } from "@/types/location";
import type { Tag, TagCount } from "@/types/tags";
import { fetchPropertyTags } from "@/lib/data/tag-utils";
import type { Filters } from "@/types/filters";
import { GeoJSON } from "geojson";

type Property = Database["public"]["Tables"]["properties"]["Row"] & { images: string[], isFavourite?: boolean, tags?: TagCount[], weighted_score: number, recommended?: boolean };
const PAGE_SIZE = 10; // number of properties to display per page

/**
 * Set whether a property is recommended or not based on whether it is in the top 3 properties for the first page of results, and has a weighted score of 50000 or less (i.e. it is a not-bad match for the user's preferences). We only want to set recommended for the first page of results, as this is where we show the properties ordered by relevance to the user's preferences, and we only want to show "recommended" for properties that are a reasonably good match for the user's preferences (i.e. weighted score of 10000 or less), as we don't want to recommend properties that are a bad match for the user's preferences, even if they are in the top 3 results.
 * @param properties Properties to set recommended for
 * @param page Page number of the properties
 * @param user_preferences User preferences
 * @param selectedTags Tags the user has selected
 * @returns 
 */
function setPropertyRecommended(properties: Property[], page: number, user_preferences: UserPreferences | null, selectedTags: Tag[] | null) {
    properties.forEach(property => {
        property.recommended = false;
    });
    // then set true for top 3 if they are a not-bad match (weighted penalty 50000 or less)
    if (page === 1 && (user_preferences || (selectedTags && selectedTags.length > 0))) {
        properties.slice(0, 3).forEach(property => {
            property.recommended = property.weighted_score <= 50000 ? true : false; // only set as recommended if they have a weighted score of 50000 or less
        })
    }
    return properties;
}

/**
 * Fetch Buyer preferences for a given buyer
 * @param id Id of the buyer to fetch preferences for
 * @returns the buyer preferences, or null if there was an error fetching the preferences or if the buyer has no preferences
 */
async function fetchBuyerPreferences(id: string | null) {
    if (!id) {
        return null;
    }
    try {
        const preferences = await fetchUserPreferences(id);
        return preferences;
    } catch (error) {
        console.error("Error fetching user preferences: ", error);
        return null;
    }
}

/**
 * Fetch images for a list of properties, and return a new list of properties with the images included. We fetch the images simultaneously for all properties to speed up the loading time, especially for pages with many properties.
 * @param data List of properties to fetch images for
 * @returns A new list of properties with the images included
 */
async function fetchPropertyImages(data: Property[]) {
    try {
        // fetch images simultaneously for all properties
        const entries = await Promise.all(
            (data ?? []).map(async (property) => {
                const imageUrls = await getImagesFromStorage(property.id);
                return { property, imageUrls };
            })
        )

        const propertiesList: Property[] = [];
        for (const { property, imageUrls } of entries) {
            if (!imageUrls) continue;
            propertiesList.push({ ...property, images: imageUrls });
        }
        return propertiesList;
    } catch (error) {
        console.error("Error fetching property images: ", error);
    }
}

/**
 * Fetch the user's favourite properties from the list of properties to display, and return a new list of properties with an isFavourite property set to true for the properties that are in the user's favourites. We fetch the favourites for all properties simultaneously to speed up the loading time, especially for pages with many properties.
 * @param propertiesList List of properties to check against the user's favourites
 * @param userId Id of the user to fetch favourites for
 * @returns New list of properties with an isFavourite property set to true for the properties that are in the user's favourites
 */
async function fetchFavouritesForProperties(propertiesList: Property[], userId: string | null) {
    try {
        const favouriteIds = userId
            ? await fetchFavourites(
                propertiesList.map((property) => property.id),
                userId,
            )
            : [];

        const favouriteIdsSet = new Set(favouriteIds);
        const propertiesWithFavourites = propertiesList.map((property) => ({
            ...property,
            isFavourite: favouriteIdsSet.has(property.id),
        }));
        return propertiesWithFavourites;
    } catch (error) {
        console.error("Error fetching favourites: ", error);
    }
}


export default function PropertiesPage() {
    const searchParams = useSearchParams();

    const [properties, setProperties] = useState<Property[]>([]);
    const [filters, setFilters] = useState<Filters>({
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
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userChecked, setUserChecked] = useState<Boolean>(false); // state to track whether we've checked if the user is logged in or not
    const [boundingBox, setBoundingBox] = useState<BoundingBox | null | undefined>(undefined); // undefined is before it is set, null is if there is no bounding box for the location (e.g. view all properties)
    const [geoJson, setGeoJson] = useState<GeoJSON | null>(null);
    const [preferencesExist, setPreferencesExist] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const updateMedia = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Read and apply filter parameters from URL
    useEffect(() => {
        const location = searchParams.get("location");
        const milesRadiusParam = searchParams.get("milesRadius");
        const minPriceParam = searchParams.get("minPrice");
        const maxPriceParam = searchParams.get("maxPrice");
        const minBedroomsParam = searchParams.get("minBedrooms");
        const maxBedroomsParam = searchParams.get("maxBedrooms");
        const minBathroomsParam = searchParams.get("minBathrooms");
        const maxBathroomsParam = searchParams.get("maxBathrooms");
        const propertyTypesParam = searchParams.get("propertyTypes");
        const garageParam = searchParams.get("garage");
        const gardenParam = searchParams.get("garden");
        const drivewayParam = searchParams.get("driveway");
        const newBuildParam = searchParams.get("new_build");
        const minSqftParam = searchParams.get("min_sqft");
        const maxSqftParam = searchParams.get("max_sqft");
        const minEpcRatingParam = searchParams.get("min_epc_rating");
        const maxEpcRatingParam = searchParams.get("max_epc_rating");
        const minCouncilTaxBandParam = searchParams.get("min_council_tax_band");
        const maxCouncilTaxBandParam = searchParams.get("max_council_tax_band");
        const includeUnderOfferParam = searchParams.get("include_under_offer");
        const includeNewBuildsParam = searchParams.get("include_new_builds");

        console.log("new filters from URL: ", {
            location,
            milesRadius: milesRadiusParam,
            minPrice: minPriceParam,
            maxPrice: maxPriceParam,
            minBedrooms: minBedroomsParam,
            maxBedrooms: maxBedroomsParam,
            minBathrooms: minBathroomsParam,
            maxBathrooms: maxBathroomsParam,
            propertyTypes: propertyTypesParam,
            garage: garageParam,
            garden: gardenParam,
            driveway: drivewayParam,
            new_build: newBuildParam,
            min_sqft: minSqftParam,
            max_sqft: maxSqftParam,
            min_epc_rating: minEpcRatingParam,
            max_epc_rating: maxEpcRatingParam,
            min_council_tax_band: minCouncilTaxBandParam,
            max_council_tax_band: maxCouncilTaxBandParam,
            include_under_offer: includeUnderOfferParam,
            include_new_builds: includeNewBuildsParam
        });

        setFilters({
            location: location || "",
            selectedTags: [],
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
            include_under_offer: includeUnderOfferParam ? includeUnderOfferParam === "true" : false,
            include_new_builds: includeNewBuildsParam ? includeNewBuildsParam === "true" : false,
        })
    }, [searchParams]);

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

    // determine whether the user is logged in or not 
    // this is needed because we need to know whether they are logged in to know whether to fetch personalised properties for them or not
    useEffect(() => {
        const supabase = createClient();
        setUserChecked(false); // reset to false when the component mounts, so that we can check if the user is logged in or not and fetch personalised properties for logged in users if applicable
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUserId(session?.user?.id ?? null);
            setUserChecked(true); // so that we know we've checked if the user is logged in or not, and can fetch personalised properties for logged in users if applicable
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setLoading(true);
        setErrorMessage("");
        setProperties([]);
        setGeoJson(null);
        // fetch the bounding box for the location in the URL query parameters and set the location state to the location name from the bounding box, so that we can display it on the page
        const urlParams = new URLSearchParams(window.location.search);
        const locationParam = urlParams.get("location");
        if (locationParam) {

            setFilters((prev) => ({ ...prev, location: locationParam }));
            getPolygonBoundingBoxForLocation(locationParam)
                .then((geoData) => {
                    if (geoData) {
                        const typedGeoData = geoData as { geojson: GeoJSON, minLat: string, maxLat: string, minLng: string, maxLng: string };
                        setBoundingBox({
                            minLatitude: parseFloat(typedGeoData.minLat),
                            maxLatitude: parseFloat(typedGeoData.maxLat),
                            minLongitude: parseFloat(typedGeoData.minLng),
                            maxLongitude: parseFloat(typedGeoData.maxLng),
                        });
                        if (typedGeoData.geojson) {
                            setGeoJson(typedGeoData.geojson);
                        } else {
                            setGeoJson(null);
                        }
                    } else {
                        setErrorMessage("Could not find your location. Check your spelling or try a different location.");
                        setProperties([]); // clear properties if there was an error fetching the bounding box for the location, to avoid showing irrelevant properties for the previously searched location
                        setBoundingBox(null);
                    }
                })
                .catch((error) => {
                    console.error("Error getting bounding box for location: ", error);
                    setLoading(false);
                });
        } else {
            setBoundingBox(null); // if there is no location query parameter, fetch all properties
        }
    }, [filters.location]);

    /**
     * Fetch properties and property images for a given search results page
     * @param page Page number to fetch properties for - default is 1
     * @param id User ID for fetching personalised properties
     * @param selectedTags Selected tags for filtering properties
     */
    const fetchProperties = useCallback(async (page: number = 1, id: string | null, box: BoundingBox | null | undefined, filters: Filters, geo: GeoJSON | null) => {
        try {
            // scroll to top
            setLoading(true);
            window.scrollTo({ top: 0 });

            let user_preferences: UserPreferences | null = null;
            if (id) {
                user_preferences = await fetchBuyerPreferences(id) ?? null;
                if (user_preferences) {
                    setPreferencesExist(true);
                }
            }
            if (box !== undefined) {
                const { data, count } = await fetchPropertiesForPage(page, PAGE_SIZE, user_preferences, box, filters, geo);
                setTotalProperties(count || 0);

                setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
                setCurrentPage(page);

                if (!data || (Array.isArray(data) && data.length === 0)) {
                    setProperties([]);
                    setLoading(false);
                    return;
                }

                const recommendedProperties = setPropertyRecommended(data as Property[], page, user_preferences, filters.selectedTags);

                const propertiesWithImages = await fetchPropertyImages(recommendedProperties);

                if (!propertiesWithImages) {
                    setProperties([]);
                    return;
                }
                const propertiesWithFavourites = await fetchFavouritesForProperties(propertiesWithImages, id) as Property[];

                if (!propertiesWithFavourites) {
                    setProperties([]);
                    return;
                }

                for (const property of propertiesWithFavourites) {
                    const tags = await fetchPropertyTags(property.id, id ?? undefined);
                    property.tags = tags;
                }
                setProperties(propertiesWithFavourites);
            }
        } catch (error) {
            console.error("Error fetching properties: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!userChecked || boundingBox === undefined) return; // don't fetch properties until we've checked if the user is logged in or not, so that we can fetch personalised properties for logged in users
        if (filters.location && boundingBox === null) return; // location is set but bbox hasn't resolved yet

        setLoading(true);
        fetchProperties(currentPage, userId, boundingBox, filters, geoJson); // fetch the first page of properties when the component mounts, and whenever the user logs in or out

    }, [fetchProperties, userChecked, userId, boundingBox, filters, geoJson]);

    return (
        <div className="bg-background min-h-screen w-full">
            <Navbar />
            <FilterBar filters={filters} setFilters={setFilters} />
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-2xl text-gray-500">Loading properties...</p>
                </div>
            ) : (

                <>
                    {errorMessage ? (
                        <div className="mx-4 flex items-center justify-center h-64">
                            <p className="text-2xl text-gray-500">{errorMessage}</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="mx-4 flex items-center justify-center h-64">
                            <p className="text-2xl text-gray-500 max-w-lg">No properties found{filters.location ? ` in ${filters.location}` : ""} with your chosen filters. Try adjusting your search criteria and try again.</p>
                        </div>
                    ) : (
                        <div className="pt-2 px-6 text-highlight">
                            <p>Showing properties {currentPage * PAGE_SIZE - (PAGE_SIZE - 1)} - {Math.min(currentPage * PAGE_SIZE, totalProperties)} of {totalProperties} properties {filters.location ? `in ${filters.location}` : ""}</p>
                        </div>
                    )
                    }
                </>
            )}
            <div className="flex w-full items-center justify-center pt-4 px-6 md:px-10 md:pt-8">
                <div className="w-full max-w-4xl">
                    {(!loading && ((preferencesExist || filters.selectedTags.length > 0) && properties.length > 0 && errorMessage === "")) &&
                        <p className="pb-2 text-highlight">Properties are ordered by your {preferencesExist && filters.selectedTags.length > 0 ? (<><a href="/protected/profile" className="hover:underline"><b>preferences</b></a> and selected tags</>) : preferencesExist ? (<a href="/protected/profile" className="hover:underline"><b>preferences</b></a>) : <>selected tags</>}</p>
                    }
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} images={property.images} page="properties" />
                    ))}
                </div>

            </div>
            <div className="flex flex-row gap-2 justify-center py-8 mb-6">
                {currentPage > 1 ? <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage - 1, userId, boundingBox, filters, geoJson)} hidden={currentPage === 1}>
                    <ChevronLeft size={16} />
                    Previous
                </Button> : (
                    <div className="mx-auto w-[100px]" />)} {/* placeholder to prevent layout shift when the Previous button is hidden */}

                <div className="flex flex-col justify-center items-center gap-2">
                    <div className="flex flex-row gap-1">
                        {/** On sm, or if there are too many pages, show only a subset of page numbers */}
                        {isMobile && totalPages > 3 && currentPage > 2 && (
                            <span className="text-lg text-muted-foreground">...</span>
                        )}
                        {!isMobile && totalPages > 8 && currentPage > 4 && (
                            <span className="text-lg text-muted-foreground">...</span>
                        )}
                        {Array.from({ length: isMobile ? 3 : totalPages > 8 ? 8 : totalPages }, (_, i) => {
                            if (isMobile) {
                                return currentPage > 1 ? (currentPage === totalPages ? currentPage - 2 + i : currentPage - 1 + i) : i + 1;
                            } else {
                                if (totalPages > 8) {
                                    if (currentPage <= 4) {
                                        return i + 1;
                                    } else if (currentPage >= totalPages - 3) {
                                        return totalPages - 7 + i;
                                    } else {
                                        return currentPage - 3 + i;
                                    }
                                }
                                return i + 1; // if total pages is 8 or less, show all page numbers
                            }
                        }).map((page) => (
                            <Button key={page} variant="outline" className={page === currentPage ? "bg-highlight text-white border-none hover:bg-highlight hover:text-white" : "hover:bg-midBlue"} size="sm" onClick={() => fetchProperties(page, userId, boundingBox, filters, geoJson)} disabled={page === currentPage}>
                                {page}
                            </Button>
                        ))}

                        {isMobile && totalPages > 3 && currentPage < totalPages - 1 && (
                            <span className="text-lg text-muted-foreground">...</span>
                        )}
                        {!isMobile && totalPages > 8 && currentPage < totalPages - 4 && (
                            <span className="text-lg text-muted-foreground">...</span>
                        )}
                    </div>
                    {properties.length > 0 && (
                        <p>Page {currentPage} of {totalPages}</p>
                    )}
                </div>

                {currentPage < totalPages ? (
                    <Button className="mx-auto bg-background hover:bg-midBlue text-highlight border-none" size="sm" onClick={() => fetchProperties(currentPage + 1, userId, boundingBox, filters, geoJson)} hidden={currentPage === totalPages}>
                        Next
                        <ChevronRight size={16} />
                    </Button>) :
                    <div className="mx-auto w-[100px]" />
                }
            </div>
        </div>
    );
}

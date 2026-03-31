"use client";
import type { Tag, TagCount } from "@/types/tags";
import styles from '../app/public/properties/page.module.css';
import { ArrowBigUp, CirclePlus } from "lucide-react";
import { Button } from "./ui/button";

const CATEGORY_ORDER = ["Parking", "Garden", "Property Features", "Location"] as const;
type Category = (typeof CATEGORY_ORDER)[number];

// get the category for a tag based on keywords in the tag name
function getTagCategory(name: string): Category {
    const normalised = name.toLowerCase();

    if (
        normalised.includes("parking") ||
        normalised.includes("garage") ||
        normalised.includes("driveway") ||
        normalised.includes("car") ||
        normalised.includes("ev charger") ||
        normalised.includes("permit")
    ) {
        return "Parking";
    }

    if (
        normalised.includes("garden") ||
        normalised.includes("patio") ||
        normalised.includes("terrace") ||
        normalised.includes("balcony") ||
        normalised.includes("outdoor")
    ) {
        return "Garden";
    }

    if (
        normalised.includes("location") ||
        normalised.includes("station") ||
        normalised.includes("transport") ||
        normalised.includes("neighborhood") ||
        normalised.includes("commute") ||
        normalised.includes("near")
    ) {
        return "Location";
    }

    return "Property Features";
}

// group tags by category for display purposes
function groupTagsByCategory<T extends { name: string }>(tags: T[]) {
    const grouped = {
        Parking: [] as T[],
        Garden: [] as T[],
        "Property Features": [] as T[],
        Location: [] as T[],
    };

    for (const tag of tags) {
        grouped[getTagCategory(tag.name)].push(tag);
    }

    return grouped;
}

export function PropertyTags({ propertyTags, allTags }: { propertyTags: TagCount[], allTags: Tag[] }) {
    const groupedPropertyTags = groupTagsByCategory(propertyTags ?? []);
    const groupedAllTags = groupTagsByCategory(allTags ?? []);

    return (
        <div>
            <hr className="mt-12" />
            <div >
                <h1 className={styles.tagHeading}>What are other Buyers Saying?</h1>
                <p>Upvote a tag to have your say</p>
                {propertyTags && propertyTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 py-2">
                        {propertyTags.map((tag) => (
                            <div key={tag.tag_id} className="inline-flex items-center gap-3 px-2 py-1 bg-buttonColor rounded-md text-md">
                                {tag.name}
                                <div className="inline-flex items-center ">
                                    <ArrowBigUp />
                                    {tag.count}
                                </div>
                            </div>

                        ))}
                    </div>
                ) : (
                    <p>No tags added yet.</p>
                )}

            </div>
            <hr className="pb-4" />
            <div className="pb-4" >
                <p>Help out other buyers by adding a tag to this property:</p>
                {allTags && allTags.length > 0 && (
                    <div className="my-3 space-y-4 mb-8">
                        {CATEGORY_ORDER.map((category) => (
                            groupedAllTags[category].length > 0 && (
                                <div key={category}>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <h2 className="font-semibold mb-2">{category}: </h2>
                                        {groupedAllTags[category].map((tag) => (
                                            <div key={tag.id} className="inline-flex items-center gap-1 px-2 py-2 bg-midBlue rounded-md text-sm">
                                                {tag.name}
                                                <CirclePlus className="w-4 h-4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                <p>Can't find the right tag? Add your own custom tag:</p>
                <div className="inline-flex items-center gap-3 px-2 py-1 rounded-md text-md">
                    <input type="text" placeholder="Add a Tag" className="bg-transparent focus:outline-none" />
                    <Button className="bg-buttonColor hover:bg-buttonHover" variant={"outline"} size={"sm"}>Add Tag</Button>
                </div>
            </div>
            <hr className="pb-4" />
        </div>
    )
}
"use client";
import type { Tag, TagCount } from "@/types/tags";
import styles from '../app/public/properties/page.module.css';
import { ArrowBigUp, CirclePlus, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { groupTagsByCategory, addTagToProperty, fetchAllTags, fetchPropertyTags, removeTagFromProperty } from "@/lib/data/tag-utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card } from "./ui/card";

const CATEGORY_ORDER = ["Parking", "Garden", "Property Features", "Location"] as const;

export function PropertyTags({ propertyId }: { propertyId: number }) {
    const [groupedAllTags, setGroupedAllTags] = useState<Record<(typeof CATEGORY_ORDER)[number], Tag[]>>({
        "Parking": [],
        "Garden": [],
        "Property Features": [],
        "Location": [],
    });
    const [propertyTags, setPropertyTags] = useState<TagCount[]>([]);
    const [openAddTag, setOpenAddTag] = useState(false);

    useEffect(() => {
        const getTags = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getClaims();
            const user = data?.claims;
            fetchPropertyTags(propertyId, user?.user_metadata?.sub || null).then((tags) => {
                setPropertyTags(tags);
            }).catch((error) => {
                console.error("Error fetching property tags: ", error);
            });
        }
        getTags();
    }, [propertyId]);

    useEffect(() => {
        const fetchAllTagsData = async () => {
            try {
                const tags = await fetchAllTags();
                // filter tags to remove those already applied to the property
                const appliedTagIds = propertyTags?.map(tag => tag.tag_id) || [];
                const filteredTags = tags.filter(propertyTag => !appliedTagIds.includes(propertyTag.id));
                const grouped = groupTagsByCategory(filteredTags);
                setGroupedAllTags(grouped);
            } catch (error) {
                console.error("Error fetching all tags: ", error);
            }
        };
        fetchAllTagsData();
    }, [propertyTags]);

    async function voteOnTag(tag: TagCount) {
        try {
            console.log("Voting on tag: ", tag);
            const supabase = createClient();
            const { data } = await supabase.auth.getClaims();
            const user = data?.claims;
            if (!user || !user.user_metadata?.sub) {
                toast.error("You must be logged in to vote on a tag.", { position: "top-right" });
                return;
            }

            // add or remove vote depending on whether user has already applied the tag or not
            if (tag.user_applied) {
                await removeTagFromProperty(propertyId, tag.tag_id, user.user_metadata.sub);
                setPropertyTags((prev) => prev.map(t => t.tag_id === tag.tag_id ? { ...t, count: t.count - 1, user_applied: false } : t));

            } else {
                await addTagToProperty(propertyId, tag.tag_id, user?.user_metadata?.sub);
                setPropertyTags((prev) => prev.map(t => t.tag_id === tag.tag_id ? { ...t, count: t.count + 1, user_applied: true } : t));
            }
        } catch (error) {
            toast.error("An error occurred while voting on the tag. Please try again.", { position: "top-right" });

        }
    }
    return (
        <Card className="p-4 border-none">
            <div >
                <h1 className={styles.tagHeading}>What are other Buyers Saying?</h1>
                <p>Upvote a tag to have your say</p>
                {propertyTags && propertyTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 py-4">
                        {propertyTags.map((tag) => (
                            <div key={tag.tag_id} className="inline-flex items-center gap-1 md:gap-3 px-2 py-1 bg-buttonColor rounded-md text-sm md:text-md">
                                {tag.name}
                                <div className="inline-flex items-center">
                                        <ArrowBigUp onClick={() => voteOnTag(tag)}  className={tag.user_applied ? "fill-muted-foreground hover:text-foreground size-6" : "size-6 hover:text-foreground"} />
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
                <div className="flex flex-row gap-4 items-center mr-4">
                    <h3 className="text-lg font-bold">Add a New Tag</h3>
                    {openAddTag ? <ChevronUp className="cursor-pointer w-10 h-10" onClick={() => setOpenAddTag(false)} />
                        : <ChevronDown className="cursor-pointer w-10 h-10" onClick={() => setOpenAddTag(true)} />}
                </div>
                {openAddTag && (
                    <>
                        {groupedAllTags && (
                            <div className="my-1 space-y-2 mb-6 mt-4">
                                {CATEGORY_ORDER.map((category) => (
                                    groupedAllTags[category].length > 0 && (
                                        <div key={category} className="md:flex md:flex-row md:gap-4 pb-4">
                                            <h2 className="font-semibold mb-2 md:w-16">{category}: </h2>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {groupedAllTags[category].map((tag) => (
                                                    <div key={tag.id} className="inline-flex items-center gap-1 px-2 py-1 bg-midBlue rounded-md text-sm">
                                                        {tag.name}
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
                    </>
                )}
            </div>
        </Card>
    )
}
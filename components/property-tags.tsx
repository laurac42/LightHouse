"use client";
import type { Tag, TagCount } from "@/types/tags";
import styles from '../app/public/properties/page.module.css';
import { ArrowBigUp, ChevronDown, ChevronUp, Plus, EllipsisVertical, Flag } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState, useCallback } from "react";
import { groupTagsByCategory, addTagToProperty, fetchAllSeedTags, fetchPropertyTags, removeTagFromProperty, addNewTagToProperty } from "@/lib/data/tag-utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

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
    const [categoryOpened, setCategoryOpened] = useState<Record<(typeof CATEGORY_ORDER)[number], boolean>>({
        "Parking": false,
        "Garden": false,
        "Property Features": false,
        "Location": false,
    });
    const [isMobile, setIsMobile] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    const updateMedia = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

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
                const tags = await fetchAllSeedTags();
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

    /**
     * Check if a user is logged in by checking for a valid user ID in the Supabase auth claims. If no valid user ID is found, an error toast is shown. 
     * @returns User ID if a user is logged in, or null if no user is logged in
     */
    async function checkLoggedIn() {
        const supabase = createClient();
        const { data } = await supabase.auth.getClaims();
        const user = data?.claims;
        if (!user || !user.user_metadata?.sub) {
            toast.error("You must be logged in to vote on a tag.", { position: "top-right" });
            return;
        }
        return user.user_metadata.sub;
    }

    /**
     * Vote on a tag for the property by either adding or removing the tag from the property depending on whether the user has already applied the tag or not. 
     * If the user has already applied the tag, their vote will be removed, and if they have not applied the tag, their vote will be added. 
     * The property tags state is also updated to reflect the change immediately in the UI without needing to refetch data from the database.
     * @param tagId Id of the tag to vote on
     * @param name Name of the tag
     * @param userHasApplied Whether the user has already voted on the tag or not
     * @param existingTag Whether the tag already exists for the property or not 
     * @returns 
     */
    async function voteOnTag(tagId: number, name: string, userHasApplied: boolean, existingTag: boolean = false) {
        try {
            const userId = await checkLoggedIn();
            if (!userId) return;

            // add or remove vote depending on whether user has already applied the tag or not
            // also update property tags state to reflect change immediately in UI without needing to refetch data from database
            if (userHasApplied) {
                await removeTagFromProperty(propertyId, tagId, userId);
                setPropertyTags((prev) => prev.filter(t => t.tag_id === tagId ? t.count > 1 : true).map(t => t.tag_id === tagId ? { ...t, count: t.count - 1, user_applied: false } : t));

            } else {
                const tagInfo = await addTagToProperty(propertyId, tagId, userId);
                if (existingTag) {
                    if (tagInfo) {
                        setPropertyTags((prev) => prev.map(t => t.tag_id === tagId ? { ...t, count: t.count + 1, user_applied: true } : t));
                    }
                } else {
                    if (tagInfo) {
                        setPropertyTags((prev) => [...prev, { tag_id: tagId, name: name, count: 1, user_applied: true }]);
                    }
                }
            }
        } catch (error) {
            toast.error("An error occurred while voting on the tag. Please try again.", { position: "top-right" });

        }
    }

    /**
     * Add a new tag to the database and apply it to the property, then update the property tags state to reflect the change immediately in the UI without needing to refetch data from the database.
     * @param name Name of the new tag to add and apply to the property
     */
    async function addNewTag(name: string) {
        try {
            const userId = await checkLoggedIn();
            if (!userId) return;

            const tagInfo = await addNewTagToProperty(propertyId, name, userId);
            if (tagInfo) {
                setPropertyTags((prev) => [...prev, { tag_id: tagInfo.tag_id, name: name, count: 1, user_applied: true }]);
                setNewTagName("");
            }
        } catch (error) {
            toast.error("An error occurred while adding the tag. Please try again.", { position: "top-right" });
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <EllipsisVertical className="w-4 h-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>
                                            <Flag className="fill-red-500"></Flag>Flag as Irrelevant
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Flag className="fill-red-500"></Flag>Flag as Inappropriate
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {tag.name}
                                < div className="inline-flex items-center" >
                                    <ArrowBigUp onClick={() => voteOnTag(tag.tag_id, tag.name, tag.user_applied, true)} className={tag.user_applied ? "fill-muted-foreground hover:text-foreground size-6" : "size-6 hover:text-foreground"} />
                                    {tag.count}
                                </div>
                            </div>

                        ))}
                    </div>
                ) : (
                    <p>No tags added yet.</p>
                )
                }

            </div >
            <hr className="pb-4" />
            <div className="pb-4" >
                <div className="flex flex-row gap-4 items-center mr-4">
                    <h3 className="text-lg font-bold">Add a New Tag</h3>
                    {openAddTag ? <ChevronUp className="cursor-pointer w-10 h-10" onClick={() => setOpenAddTag(false)} />
                        : <ChevronDown className="cursor-pointer w-10 h-10" onClick={() => setOpenAddTag(true)} />}

                </div>
                {openAddTag ? (
                    <p className="text-sm text-muted-foreground">Add a tag to help other buyers</p>
                ) : (
                    <p className="text-sm text-muted-foreground">Click the menu to view available tags </p>
                )}
                {openAddTag && (
                    <>
                        {groupedAllTags && (
                            <div className="my-1 space-y-2 mb-6 mt-4">
                                {CATEGORY_ORDER.map((category) => (
                                    groupedAllTags[category].length > 0 && (
                                        <div key={category} className="md:flex md:flex-row md:gap-4 pb-4 md:pb-8">
                                            <div className="flex flex-row items-center gap-2">
                                                <h2 className="font-semibold mb-2 md:w-16">{category}: </h2>
                                                {categoryOpened[category] ? <ChevronUp className="md:hidden cursor-pointer w-6 h-6 mb-2" onClick={() => setCategoryOpened({ ...categoryOpened, [category]: false })} />
                                                    : <ChevronDown className="md:hidden cursor-pointer w-6 h-6 mb-2" onClick={() => setCategoryOpened({ ...categoryOpened, [category]: true })} />}
                                            </div>
                                            {(categoryOpened[category] || !isMobile) && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {groupedAllTags[category].map((tag) => (
                                                        <div key={tag.id} className="inline-flex items-center gap-1 px-2 py-1 bg-midBlue rounded-md text-sm">
                                                            {tag.name}
                                                            <Plus onClick={() => voteOnTag(tag.id, tag.name, false)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        <p>Can't find the right tag? Add your own custom tag:</p>
                        <div className="inline-flex items-center gap-3 px-2 py-1 rounded-md text-md">
                            <Input type="text" placeholder="Add a Tag" className="bg-transparent focus:outline-none" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                            <Button onClick={() => addNewTag(newTagName)} className="bg-buttonColor hover:bg-buttonHover text-foreground" variant={"default"} size={"sm"}>Add Tag</Button>
                        </div>
                    </>
                )}
            </div>
        </Card >
    )
}
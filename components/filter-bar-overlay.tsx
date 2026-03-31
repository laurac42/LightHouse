import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Tag } from "@/types/tags";
import { useEffect, useState } from "react";

type FilterBarOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedTags: Tag[];
    setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
    allTags: Tag[];
    setAllTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

export default function FilterBarOverlay({
    isOpen,
    onClose,
    selectedTags,
    setSelectedTags,
    allTags,
    setAllTags,
}: FilterBarOverlayProps) {
    if (!isOpen) return null;
    const [filterTags, setFilterTags] = useState<Tag[]>([]);

    useEffect(() => {
        setFilterTags(selectedTags);
    }, [selectedTags]);

    return (
        <div>
            <div className="fixed inset-0 bg-black/50 z-[101]" onClick={onClose} />
            <div className="fixed top-0 right-0 h-screen w-1/2 lg:w-1/3 bg-navBar flex flex-col space-y-4 p-6 z-[102] shadow-lg overflow-y-auto">
                <div className="flex flex-row items-center mb-4 gap-4">
                    <div className="flex flex-row items-center">
                        <p className="text-lg font-bold">More Filters</p>
                    </div>
                    <Button variant="ghost" className="hover:bg-transparent" onClick={onClose}>
                        <X className="size-6" />
                    </Button>
                </div>

                {/* Tag prioritisation - allow users to select tags to prioritise in search results */}
                <div>
                    <h3 className="text-lg font-bold mb-2">Prioritise by Tag</h3>
                    {selectedTags.length > 0 && (
                        <>
                            <h3 className="text-md font-semibold mb-2">Selected Tags</h3>
                            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto mb-2">
                                {filterTags.map((tag) => (
                                    <Button
                                        key={tag.id}
                                        variant={"outline"}
                                        className="inline-block bg-yellow hover:bg-yellowHover text-foreground text-xs px-2 py-1 rounded-xl mr-2 mb-2"
                                        onClick={() => {
                                            setAllTags([...allTags, tag]);
                                            setFilterTags(filterTags.filter(t => t.id !== tag.id))
                                        }}
                                    >
                                        {tag.name}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
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
                                            setFilterTags([...filterTags, tag]);
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
            <div className="fixed bottom-4 right-4 z-[103]">
                <Button variant={"link"} className="mr-4" onClick={() => {
                    setFilterTags([]);
                    setAllTags([...allTags, ...filterTags]);
                }}>
                    Clear All
                </Button>
                <Button onClick={() => {
                    setSelectedTags(filterTags);
                    onClose();
                }} className="bg-highlight hover:bg-highlight/90 text-white">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}

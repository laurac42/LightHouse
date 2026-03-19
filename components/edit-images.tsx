import { getImagesFromStorage } from "@/lib/data/images";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import FileUploadComponent from "@/components/file-upload-list-3";

const CATEGORIES = [
    { key: "exterior", label: "Exterior Images" },
    { key: "living room", label: "Living Room Images" },
    { key: "kitchen", label: "Kitchen Images" },
    { key: "dining room", label: "Dining Room Images" },
    { key: "bedroom", label: "Bedroom Images" },
    { key: "bathroom", label: "Bathroom Images" },
    { key: "garden", label: "Garden Images" },
    { key: "floorplan", label: "Floorplans" },
    { key: "other", label: "Other Images", description: "Images that don't fit into the other categories, e.g. additional rooms, parking, views etc." },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];
export type StagedFiles = Record<CategoryKey, File[]>;

type Props = {
    params: { id: number | null};
    onStagedFilesChange: (files: StagedFiles) => void;
    onDeletedImagesChange: (images: string[]) => void;
};

const emptyStagedFiles = (): StagedFiles =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, []])) as unknown as StagedFiles;

export default function EditImages({ params, onStagedFilesChange, onDeletedImagesChange }: Props) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [staged, setStaged] = useState<StagedFiles>(emptyStagedFiles);
    const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!params.id) return;
            const urls = await getImagesFromStorage(params.id);
            setImageUrls(urls);
        };
        fetchImages();
    }, []);

    const handleFilesChange = (category: CategoryKey, files: File[]) => {
        const updated = { ...staged, [category]: files };
        setStaged(updated);
        onStagedFilesChange(updated);
    };

    const handleDeleteImage = (filename: string) => {
        setImageUrls((current) => current.filter((url) => url !== filename));
        setImagesMarkedForDeletion((current) => {
            if (current.includes(filename)) {
                return current;
            }

            const updated = [...current, filename];
            return updated;
        });
        onDeletedImagesChange([...imagesMarkedForDeletion, filename]);

    };

    return (
        <div className="flex flex-col gap-6">
            {imagesMarkedForDeletion.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    {imagesMarkedForDeletion.length} image{imagesMarkedForDeletion.length === 1 ? "" : "s"} pending deletion. Changes will be applied when you click save.
                </p>
            )}
            {CATEGORIES.map(({ key, label, ...rest }) => {
                const description = "description" in rest ? rest.description : undefined;
                const filtered = imageUrls.filter((url) => url.startsWith(key));

                return (
                    <div key={key}>
                        <Label className="py-2 text-lg">{label}</Label>
                        {description && (
                            <p className="text-sm text-muted-foreground pb-2">{description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filtered.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={process.env.NEXT_PUBLIC_BUCKET_URL + "properties/" + params.id + "/" + url}
                                        alt={`Property Image ${index + 1}`}
                                        className="w-full h-48 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1"
                                        onClick={() => handleDeleteImage(url)}
                                        aria-label={`Delete image ${index + 1}`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <p className="text-sm text-muted-foreground col-span-full">
                                    No {label.toLowerCase()} uploaded.
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <FileUploadComponent
                                files={staged[key]}
                                onFilesChange={(files) => handleFilesChange(key, files)}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
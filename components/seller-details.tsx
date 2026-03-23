import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SellerImages from "./seller-images";
import { StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteImageFromStorage } from "@/lib/data/images";
import { updateSellerAddedInfo } from "@/lib/data/edit-property";
import { Property } from "@/types/property";

export default function SellerDetails({ property, reason, description, page }: { property: Property, reason: string | null, description: string | null, page: string }) {
    const [sellerDetails, setSellerDetails] = useState<string | null>(description);
    const [editing, setEditing] = useState(false);
    const [updatedReason, setUpdatedReason] = useState<string | null>(reason);
    const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);

    useEffect(() => {
        setSellerDetails(description);
    }, [description]);

    useEffect(() => {
        setUpdatedReason(reason);
    }, [reason]);

    // handle saving updated seller added info
    async function handleSellerInfoUpdate() {
        try {
            await updateSellerAddedInfo(property.id, sellerDetails || "", updatedReason || "");

            if (imagesMarkedForDeletion.length > 0) {
                for (const filename of imagesMarkedForDeletion) {
                    await deleteImageFromStorage(property.id, filename, true);
                }
            }

            setImagesMarkedForDeletion([]);
        } catch (error) {
            console.error("Error updating seller info:", error);
        }
        setEditing(false);
    }

    return (
        <div className='rounded-md p-4 bg-yellow/80 mb-20 md:mb-28 lg:mb-8 whitespace: shadow-md'>
            <div className="flex flex-row justify-between items-center mb-2">
                <h1 className='inline-flex items-center gap-2 text-2xl font-bold mb-4'><StickyNote /> What does the seller have to say?</h1>
                {page === "edit" && !editing && (
                    <Button onClick={() => setEditing(true)} className="bg-foreground mb-4">Edit</Button>
                )}
            </div>
            {editing ? (
                <div>
                    <Label className="text-foreground-muted text-sm mb-1">Seller's description of the property</Label>
                    <Input defaultValue={sellerDetails || ""} onChange={(e) => setSellerDetails(e.target.value)} placeholder="Seller's description of the property" className="mb-4 border border-foreground" />
                    <hr className='my-4' />
                    <Label className="text-foreground-muted text-sm mb-1">Reason for selling</Label>
                    <Input defaultValue={updatedReason || ""} onChange={(e) => setUpdatedReason(e.target.value)} placeholder="Reason for selling" className="mb-4 border border-foreground" />
                    <hr className='my-4' />
                    <h1 className="text-lg font-bold">Images Uploaded by the Seller</h1>
                    <SellerImages id={property.id} editing={editing} onDeletedImagesChange={setImagesMarkedForDeletion} />
                    <Button onClick={handleSellerInfoUpdate} className="bg-foreground">Save</Button>
                </div>
            ) : (
                <div>
                    <p>"{sellerDetails}"</p>
                    <hr className='my-4' />
                    <p className="text-foreground-muted text-xs">Reason for selling: </p>
                    <p>{updatedReason}</p>
                    <hr className='my-4' />
                    <h1 className="text-lg font-bold">Images Uploaded by the Seller</h1>
                    <SellerImages id={property.id} editing={editing} onDeletedImagesChange={null} />
                </div>)}
        </div>
    )
}
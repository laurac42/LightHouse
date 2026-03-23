import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { loadSellerImages } from "@/lib/data/images";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type Props = {
    id: number;
    editing: boolean;
    onDeletedImagesChange: ((images: string[]) => void) | null;
};

export default function SellerImages({ id, editing, onDeletedImagesChange }: Props) {
    const [images, setImages] = useState<string[]>([]);
    const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);

    useEffect(() => {
        loadSellerImages(id).then((imageNames) => {
            setImages(imageNames);
        });
    }, [id]);

    const handleDeleteImage = (filename: string) => {
        setImages((current) => current.filter((name) => name !== filename));
        setImagesMarkedForDeletion((current) => {
            if (current.includes(filename)) return current;
            return [...current, filename];
        });
    };

    useEffect(() => {
        if (onDeletedImagesChange) {
            onDeletedImagesChange(imagesMarkedForDeletion);
        }
    }, [imagesMarkedForDeletion]);


    return (
        <>
            {imagesMarkedForDeletion.length > 0 && editing && (
                <p className="text-sm text-muted-foreground mb-2 mt-4">
                    {imagesMarkedForDeletion.length} image{imagesMarkedForDeletion.length === 1 ? "" : "s"} pending deletion. Changes will be applied when you click save.
                </p>
            )}
            {images.length > 0 && (
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full mt-4 mb-4"
                >
                    <CarouselContent>
                        {images.map((filename, index) => (
                            <CarouselItem key={index} className="w-full basis-1/2" >
                                <Card className="w-full h-full border-none rounded-md relative">
                                    <CardContent className="p-0 w-full h-full">
                                        <img src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/properties/${id}/seller/${filename}`} alt={`Seller image ${index + 1}`} className="w-full h-full object-cover border-none rounded-md" />
                                        {editing && (
                                            <Button type="button" className="absolute bg-foreground top-2 right-2" onClick={() => handleDeleteImage(filename)}>
                                                <X />
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 2 && (
                        <>
                            <CarouselPrevious className="absolute left-2" />
                            <CarouselNext className="absolute right-2" />
                        </>
                    )}
                </Carousel>
            )}
        </>
    );
}
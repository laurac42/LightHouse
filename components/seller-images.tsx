import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { loadSellerImages } from "@/lib/data/images";

export default function SellerImages({ id }: { id: number }) {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        console.log(`Loading images for seller with id: ${id}`);
        loadSellerImages(id).then((imageNames) => {
            console.log(`Loaded image names: ${imageNames}`);
            const imageUrls = imageNames.map((name) => `${process.env.NEXT_PUBLIC_BUCKET_URL}/properties/${id}/seller/${name}`);
            setImages(imageUrls);
        });
    }, []);


    return (
        <>
            {images.length > 0 && (
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full mt-2 mb-4"
                >
                    <CarouselContent>
                        {images.map((url, index) => (
                            <CarouselItem key={index} className="w-full basis-1/2" >
                                <Card className="w-full h-full">
                                    <CardContent className="p-0 w-full h-full">
                                        <img src={url} alt={`Seller image ${index + 1}`} className="w-full h-full object-cover border-none rounded-md" />
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
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react";
import { Database } from "@/types/supabase";
import { Car, Camera } from "lucide-react";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function ImageCarousel({ images, property }: { images: string[]; property: Property }) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }
        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    /**
         * Get the first image URL from the list of images, prioritizing exterior images
         * @param images List of image URLs to select from
         * @returns URL of the first image to display, or null if no images are available
         */
    function getFirstImageUrl(images: string[]) {
        if (images.length === 0) {
            return null;
        }
        for (const imageUrl of images) {
            if (imageUrl.includes('exterior')) {
                return imageUrl;
            }
        }
        return images[0]; // return the first image if no exterior image is found
    }

    return (

        <Carousel
            setApi={setApi}
            className="w-full"
            opts={{ loop: true, }}>
            <CarouselContent>
                <CarouselItem key={1}>
                    {getFirstImageUrl(images) ? (
                        <img
                            src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/' + getFirstImageUrl(images)}
                            alt={`Main image of ${property.title}`}
                            className="w-full h-64 object-cover rounded-t-md"
                        />
                    ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-t-md">
                            <Car className="text-gray-500" size={48} />
                            <p className="text-gray-500 mt-2">No images available</p>
                        </div>
                    )}
                </CarouselItem>
                {images.map((imageUrl, index) => {
                    // Skip the first image since it's already displayed as the main image
                    if (imageUrl !== getFirstImageUrl(images) && (!imageUrl.includes('floorplan'))) {
                        return (
                            <CarouselItem key={index}>
                                <img
                                    src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/' + imageUrl}
                                    alt={`Image ${index + 1} of ${property.title}`}
                                    className="w-full h-64 object-cover rounded-t-md"
                                />
                            </CarouselItem>
                        );
                    }
                    return null;
                })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2" />
            <CarouselNext className="absolute right-2" />
            <p className="absolute right-2 top-2 text-sm inline-flex gap-1 items-center bg-navBar rounded-md p-1"><Camera size={16} /> {current} of {count}</p>
        </Carousel>);
}
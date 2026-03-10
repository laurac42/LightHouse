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
import { Camera, XCircleIcon } from "lucide-react";
import { createPortal } from "react-dom";

type Property = Database["public"]["Tables"]["properties"]["Row"];

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

export default function ImageCarousel({ images, property, page }: { images: string[]; property: Property; page: string }) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const firstImageUrl = getFirstImageUrl(images);
    const displayImages = [
        ...(firstImageUrl ? [firstImageUrl] : []),
        ...images.filter((imageUrl) => imageUrl !== firstImageUrl && !imageUrl.includes("floorplan")),
    ];

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

    useEffect(() => {
        if (selectedImageIndex !== null) {
            // add evernt listener for escape key to close modal
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setSelectedImageIndex(null);
                }
            };
            document.addEventListener("keydown", handleKeyDown);
        }
    }, [selectedImageIndex])

    return (
        <div>
            <Carousel
                setApi={setApi}
                className="w-full"
                opts={{ loop: true, }}>
                <CarouselContent>
                    <CarouselItem key={1}>
                        {firstImageUrl && (
                            <img
                                src={process.env.NEXT_PUBLIC_BUCKET_URL + "properties/" + property.id + "/" + firstImageUrl}
                                alt={`Main image of ${property.title}`}
                                className={page === "property-details" ? "w-full h-[80vh] object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}
                                onClick={() => setSelectedImageIndex(0)}
                            />
                        )}
                    </CarouselItem>
                    {images.map((imageUrl, index) => {
                        // Skip the first image since it's already displayed as the main image
                        if (imageUrl !== firstImageUrl && (!imageUrl.includes('floorplan'))) {
                            return (
                                <CarouselItem key={index}>
                                    <img
                                        src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/' + imageUrl}
                                        alt={`Image ${index + 1} of ${property.title}`}
                                        className={page === "property-details" ? "w-full h-[80vh] object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}

                                        onClick={() => {
                                            const clickedIndex = displayImages.findIndex((displayImage) => displayImage === imageUrl);
                                            setSelectedImageIndex(clickedIndex >= 0 ? clickedIndex : 0);

                                        }}
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
                <p className="absolute right-2 bottom-2 text-sm inline-flex gap-1 items-center bg-navBar rounded-md p-1">Click on an image to view it in full size</p>
            </Carousel>

            {/** Modal for displaying selected image */}
            {selectedImageIndex !== null && createPortal(
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setSelectedImageIndex(null)}
                >
                    <XCircleIcon size={32} className="absolute top-6 right-6 text-white cursor-pointer" onClick={() => setSelectedImageIndex(null)} />
                    <div className="w-full max-w-[90vw]">
                        <Carousel
                            key={selectedImageIndex}
                            className="w-full"
                            opts={{ loop: true, startIndex: selectedImageIndex }}>
                            <CarouselContent>
                                {displayImages.map((imageUrl, index) => (
                                    <CarouselItem key={index}>
                                        <img
                                            src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/' + imageUrl}
                                            alt={`Image ${index + 1} of ${property.title}`}
                                            className="w-full max-h-[90vh] object-contain"
                                            onClick={e => { e.stopPropagation }}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div onClick={(e) => e.stopPropagation()}>
                                <CarouselPrevious />
                                <CarouselNext />
                            </div>
                        </Carousel>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
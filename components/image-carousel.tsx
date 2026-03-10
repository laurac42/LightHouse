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
import { Camera, XCircleIcon, Grid2X2 } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

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

function floorPlanImageExists(images: string[]) {
    return images.some(imageUrl => imageUrl.toLowerCase().includes('floorplan'));
}

export default function ImageCarousel({ images, property, page }: { images: string[]; property: Property; page: string }) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [showFloorplan, setShowFloorplan] = useState(false);
    const [floorPlanExists, setFloorPlanExists] = useState(false);

    useEffect(() => {
        setFloorPlanExists(floorPlanImageExists(images));
    }, [images]);

    const firstImageUrl = getFirstImageUrl(images);
    const displayImages = [
        ...(firstImageUrl ? [firstImageUrl] : []),
        ...images.filter((imageUrl) => imageUrl !== firstImageUrl && !imageUrl.includes("floorplan")),
    ];

    useEffect(() => {
        if (firstImageUrl) {
            setSelectedImageUrl(firstImageUrl);
        }
    }, [firstImageUrl]);

    useEffect(() => {
        if (!api) {
            return
        }
        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
            setSelectedImageUrl(displayImages[api.selectedScrollSnap()] || null);
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
                {showFloorplan && floorPlanExists && page === "property-details" ? (
                    <CarouselContent>
                        <CarouselItem key="floorplan">
                            <img
                                src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/' + images.find(imageUrl => imageUrl.toLowerCase().includes('floorplan'))}
                                alt={`Floorplan of ${property.title}`}
                                className="w-full h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md"
                                onClick={() => setSelectedImageIndex(-1)}
                            />
                        </CarouselItem>
                    </CarouselContent>
                ) : (
                    <>
                        <CarouselContent>
                            <CarouselItem key={1}>
                                {firstImageUrl && (
                                    <img
                                        src={process.env.NEXT_PUBLIC_BUCKET_URL + "properties/" + property.id + "/" + firstImageUrl}
                                        alt={`Main image of ${property.title}`}
                                        className={page === "property-details" ? "w-full h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}
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
                                                className={page === "property-details" ? "w-full h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}
                                                onClick={() => {
                                                    if (page === "property-details") {
                                                        const clickedIndex = displayImages.findIndex((displayImage) => displayImage === imageUrl);
                                                        setSelectedImageIndex(clickedIndex >= 0 ? clickedIndex : 0);
                                                    }
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
                    </>
                )}
                {page === "property-details" && (
                    <>
                        {showFloorplan && floorPlanExists ? (
                            <Button onClick={() => setShowFloorplan(false)} className="bg-white/90 h-12 absolute bottom-2 right-2 text-md p-4 inline-flex gap-1" variant="outline">Images<Camera size={16} /></Button>
                        ) : (
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <Button onClick={() => {
                                    console.log("selectedImageUrl is: ", selectedImageUrl);
                                    const clickedIndex = displayImages.findIndex((displayImage) => displayImage === selectedImageUrl);
                                    console.log("clickedIndex is: ", clickedIndex);
                                    setSelectedImageIndex(clickedIndex >= 0 ? clickedIndex : 0);

                                }} className="bg-white/90 h-12 inline-flex gap-1 text-md" variant="outline">All images <Camera size={16} /></Button>
                                <Button onClick={() => setShowFloorplan(true)} className="bg-white/90 h-12 text-md p-4 inline-flex gap-1" variant="outline">Floorplan <Grid2X2 size={16} /></Button>
                            </div>
                        )}
                    </>
                )}
            </Carousel>

            {/** Modal for displaying selected image */}
            {
                selectedImageIndex !== null && createPortal(
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
                                    {selectedImageIndex === -1 ? (
                                        <CarouselItem key="floorplan">
                                            <img
                                                src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/floorplan.png'}
                                                alt="Floorplan"
                                                className="w-full max-h-[90vh] object-contain"
                                            />
                                        </CarouselItem>
                                    ) :
                                        <>
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
                                        </>
                                    }
                                </CarouselContent>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </div>
                            </Carousel>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
}
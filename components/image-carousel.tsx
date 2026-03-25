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

/**
 * Check if a floor plan image exists in the list of images by looking for 'floorplan' in the image URLs
 * @param images lst of image URLs to check for a floor plan image
 * @returns boolean indicating whether a floor plan image exists in the list of images
 */
function floorPlanImageExists(images: string[]) {
    return images.some(imageUrl => imageUrl.toLowerCase().includes('floorplan'));
}


// Pages can either be "property-details", "properties", or "manage" - this determines the size of the carousel and whether the floor plan button is shown
export default function ImageCarousel({ images, property, page, isModalOpen }: { images: string[]; property: Property; page: string; isModalOpen?: ((isModalOpen: boolean) => void) | null }) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [showFloorplan, setShowFloorplan] = useState(false);
    const [floorPlanExists, setFloorPlanExists] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // handle the image modal being opened
    // this allows the parent component to know whether the modal is open or not so it can hide the agency card when the modal is open
    const handleOpen = () => {
        setModalOpen(true);
        isModalOpen?.(true);
    }

    // handle the image modal being closed
    // this allows the parent component to know whether the modal is open or not so it can hide the agency card when the modal is open
    const handleClose = () => {
        setModalOpen(false);
        isModalOpen?.(false);
    }

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

    // Add event listener for the escape key to close the modal when an image is selected
    useEffect(() => {
        if (selectedImageIndex !== null) {
            // add event listener for escape key to close modal
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setSelectedImageIndex(null);
                    handleClose();
                }
            };
            document.addEventListener("keydown", handleKeyDown);
        }
    }, [selectedImageIndex])

    return (
        <div>
            <Carousel
                setApi={setApi}
                opts={{ loop: true, }}
                className="w-full">
                {showFloorplan && floorPlanExists && page === "property-details" ? (
                    <CarouselContent>
                        <CarouselItem key="floorplan">
                            <img
                                src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + property.id + '/' + images.find(imageUrl => imageUrl.toLowerCase().includes('floorplan'))}
                                alt={`Floorplan of ${property.title}`}
                                className="w-full h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md"
                                onClick={() => {
                                    setSelectedImageIndex(-1);
                                    handleOpen();
                                }}
                            />
                        </CarouselItem>
                    </CarouselContent>
                ) : (
                    <>
                        <CarouselContent>
                            {images.length === 0 ? (
                                <CarouselItem key="no-image">
                                    <div className={page === "property-details" ? "w-full h-[40vh] sm:h-[60vh] md:h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md" : page === "manage" ? "w-full h-48 object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}>
                                        <p className="text-muted-foreground items-center p-2">No images available</p>
                                    </div>
                                </CarouselItem>
                            ) : (
                                <>
                                    <CarouselItem key={1}>
                                        {firstImageUrl && (
                                            <img
                                                src={process.env.NEXT_PUBLIC_BUCKET_URL + "properties/" + property.id + "/" + firstImageUrl}
                                                alt={`Main image of ${property.title}`}
                                                className={page === "property-details" ? "w-full h-[40vh] sm:h-[60vh] md:h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md" : page === "manage" ? "w-full h-48 object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}
                                                onClick={() => {
                                                    setSelectedImageIndex(0);
                                                    handleOpen();
                                                }}
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
                                                        className={page === "property-details" ? "w-full h-[40vh] sm:h-[60vh] md:h-[80vh] 2xl:h-[60vh] object-cover rounded-t-md" : page === "manage" ? "w-full h-48 object-cover rounded-t-md" : "w-full h-64 object-cover rounded-t-md"}
                                                        onClick={() => {
                                                            if (page === "property-details") {
                                                                const clickedIndex = displayImages.findIndex((displayImage) => displayImage === imageUrl);
                                                                setSelectedImageIndex(clickedIndex >= 0 ? clickedIndex : 0);
                                                                handleOpen();
                                                            }
                                                        }}
                                                    />
                                                </CarouselItem>
                                            );
                                        }
                                        return null;
                                    })}
                                </>
                            )}
                        </CarouselContent>

                        {images.length > 1 && (
                            <>
                                <CarouselPrevious className="absolute left-2" />
                                <CarouselNext className="absolute right-2" />
                                <p className="absolute right-2 top-2 text-sm inline-flex gap-1 items-center bg-navBar rounded-md p-1"><Camera size={16} /> {current} of {count}</p>
                            </>
                        )}

                        {(page === "properties" || page === "property-details") && property.status == "under offer" &&
                            <p className="absolute left-2 top-2 text-sm inline-flex gap-1 items-center bg-yellow rounded-md p-1">
                                Under Offer
                            </p>}
                    </>
                )}
                {page === "property-details" && (
                    <>
                        {showFloorplan && floorPlanExists ? (
                            <Button onClick={() => setShowFloorplan(false)} className="bg-white/90 h-12 absolute bottom-2 right-2 text-md p-4 inline-flex gap-1" variant="outline">Images<Camera size={16} /></Button>
                        ) : (
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <Button onClick={() => {
                                    const clickedIndex = displayImages.findIndex((displayImage) => displayImage === selectedImageUrl);
                                    setSelectedImageIndex(clickedIndex >= 0 ? clickedIndex : 0);
                                    handleOpen();
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
                        className="fixed inset-0 bg-black/70 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                            setSelectedImageIndex(null);
                            handleClose();
                        }
                        }
                        style={{ zIndex: 50 }}
                    >
                        <XCircleIcon size={32} className="absolute top-6 right-6 text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log("clicked close icon")
                                setSelectedImageIndex(null);
                                handleClose();
                                console.log("clicked close icon, setting selectedImageIndex to null and closing modal")
                            }} />
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
                                <div onClick={(e) => e.stopPropagation()} >
                                    <CarouselPrevious className="absolute left-1" />
                                    <CarouselNext className="absolute right-1" />
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
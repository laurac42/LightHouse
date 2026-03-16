import { getImagesFromStorage } from "@/lib/data/images";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, PlusCircleIcon } from "lucide-react";

export default function EditImages({ params }: { params: { id: number } }) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            const urls = await getImagesFromStorage(params.id);
            setImageUrls(urls);
        };
        fetchImages();
    }, []);
    return (
        <div className="flex flex-col gap-6">
            <div>
                <Label className="py-2 text-lg" htmlFor="exteriorImages">Exterior Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'exterior' prefix */}
                    {imageUrls.filter((url) => url.startsWith('exterior')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('exterior')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No exterior images uploaded.</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                    <PlusCircleIcon size={16} />
                    &nbsp; Add Exterior Image
                </Button>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="livingRoomImages">Living Room Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'living room' prefix */}
                    {imageUrls.filter((url) => url.startsWith('living room')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('living room')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No living room images uploaded.</p>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                        <PlusCircleIcon size={16} />
                        &nbsp; Add Living Room Image
                    </Button>
                </div>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="kitchenImages">Kitchen Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'kitchen' prefix */}
                    {imageUrls.filter((url) => url.startsWith('kitchen')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('kitchen')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No kitchen images uploaded.</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                    <PlusCircleIcon size={16} />
                    &nbsp; Add Kitchen Image
                </Button>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="diningRoomImages">Dining Room Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'dining room' prefix */}
                    {imageUrls.filter((url) => url.startsWith('dining room')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('dining room')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No dining room images uploaded.</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                    <PlusCircleIcon size={16} />
                    &nbsp; Add Dining Room Image
                </Button>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="bedroomImages">Bedroom Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'bedroom' prefix */}
                    {imageUrls.filter((url) => url.startsWith('bedroom')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('bedroom')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No bedroom images uploaded.</p>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                        <PlusCircleIcon size={16} />
                        &nbsp; Add Bedroom Image
                    </Button>
                </div>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="bathroomImages">Bathroom Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'bathroom' prefix */}
                    {imageUrls.filter((url) => url.startsWith('bathroom')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('bathroom')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No bathroom images uploaded.</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                    <PlusCircleIcon size={16} />
                    &nbsp; Add Bathroom Image
                </Button>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="gardenImages">Garden Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                    {/** display only images with 'garden' prefix */}
                    {imageUrls.filter((url) => url.startsWith('garden')).map((url, index) => (
                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('garden')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No garden images uploaded.</p>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                        <PlusCircleIcon size={16} />
                        &nbsp; Add Garden Image
                    </Button>
                </div>
            </div>

            <div>
                <Label className="py-2 text-lg" htmlFor="otherImages">Other Images</Label>
                <p className="text-sm text-muted-foreground pb-2">Images that don't fit into the other categories, e.g. additional rooms, parking, views etc.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/** display only images with 'other' prefix */}
                    {imageUrls.filter((url) => url.startsWith('other')).map((url, index) => (

                        <div key={index} className="relative">
                            <img src={process.env.NEXT_PUBLIC_BUCKET_URL + 'properties/' + params.id + '/' + url} alt={`Property Image ${index + 1}`} className="w-full h-48 object-cover rounded" />
                            <button className="absolute top-2 right-2 bg-buttonColor hover:bg-buttonColor/90 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {/** If there are no images, display a message */}
                    {imageUrls.filter((url) => url.startsWith('other')).length === 0 && (
                        <p className="text-sm text-muted-foreground">No additional images uploaded.</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <Button className="bg-midBlue hover:bg-midBlue/90 text-foreground">
                    <PlusCircleIcon size={16} />
                    &nbsp; Add 'Other' Image
                </Button>
            </div>

        </div>
    );
}
'use client';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { fetchPropertyDetails } from "@/lib/data/property-utils";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from "./ui/input-group";
import { X, PlusCircleIcon } from "lucide-react";
import type { Address } from "@/types/address";
import { Button } from "./ui/button";
import EditImages from "./edit-images";
import { editProperty } from "@/lib/data/edit-property";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog"

/**
 * Remove a feature from the features array at the specified index and update the state
 * @param index 
 * @param features 
 * @param setFeatures 
 */
function removeFeature(index: number, features: string[], setFeatures: React.Dispatch<React.SetStateAction<string[]>>) {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
}

export default function EditPropertyForm({ propertyId }: { propertyId: number }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [priceType, setPriceType] = useState("");
    const [features, setFeatures] = useState<string[]>([]);
    const [address, setAddress] = useState<Address | null>(null);
    const [epc, setEpc] = useState("");
    const [councilTaxBand, setCouncilTaxBand] = useState("");
    const [numBedrooms, setNumBedrooms] = useState("");
    const [numBathrooms, setNumBathrooms] = useState("");
    const [squareFeet, setSquareFeet] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [garage, setGarage] = useState(false);
    const [newBuild, setNewBuild] = useState(false);
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            const property = await fetchPropertyDetails(propertyId);
            if (property) {
                setTitle(property.title);
                setDescription(property.description);
                setPrice(property.price.toString());
                setPriceType(property.price_type || "");
                setFeatures(property.features || []);
                setAddress({
                    address_line_1: property.address_line_1,
                    address_line_2: property.address_line_2,
                    city: property.city,
                    post_code: property.post_code,
                });
                setEpc(property.epc_rating || "");
                setCouncilTaxBand(property.council_tax_band || "");
                setNumBedrooms(property.num_bedrooms?.toString() || "");
                setNumBathrooms(property.num_bathrooms?.toString() || "");
                setSquareFeet(property.square_feet?.toString() || "");
                setPropertyType(property.property_type || "");
                setGarage(property.has_garage || false);
                setNewBuild(property.is_new_build || false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    /**
 * Handle the form being submitted and update the property details in the database with the new values from the form
 * @param e event object from the form submission
 */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            await editProperty(propertyId, {
                title,
                description: description,
                features: features,
                price: parseFloat(price),
                price_type: priceType,
                address_line_1: address?.address_line_1 || undefined,
                address_line_2: address?.address_line_2 || null,
                city: address?.city || undefined,
                post_code: address?.post_code || undefined,
                epc_rating: epc || null,
                council_tax_band: councilTaxBand || null,
                num_bedrooms: numBedrooms ? parseInt(numBedrooms) : null,
                num_bathrooms: numBathrooms ? parseInt(numBathrooms) : null,
                square_feet: squareFeet ? parseInt(squareFeet) : null,
                property_type: propertyType || null,
                has_garage: garage,
                is_new_build: newBuild,
            });
            setSuccessMessage("Property details updated successfully!");
            setErrorMessage(null);

        } catch (error) {
            console.error("Error updating property", error);
            setErrorMessage("Failed to update property details.");
            setSuccessMessage(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Dialog open={loading}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editing Property</DialogTitle>
                    </DialogHeader>
                    <p>Your property is being edited...</p>
                </DialogContent>
            </Dialog>
            <Dialog open={!!errorMessage}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Error Editing Property</DialogTitle>
                    </DialogHeader>
                    <p className="text-red-600">{errorMessage}</p>
                    <p>Please try again</p>
                    <DialogFooter className="justify-end">
                        <DialogClose asChild > 
                            <Button className="bg-buttonColor hover:bg-buttonColor/90 text-foreground" onClick={() => setErrorMessage(null)} type="button">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!successMessage}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Property Successfully Edited!</DialogTitle>
                    </DialogHeader>
                    <p className="text-green-600">{successMessage}</p>
                    <DialogFooter className="justify-end">
                        <DialogClose asChild>
                            <Button className="bg-buttonColor hover:bg-buttonColor/90 text-foreground" onClick={() => setSuccessMessage(null)} type="button">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <form onSubmit={handleSubmit}>
                <Card className="bg-white/90 border-none">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Edit Property with ID: {propertyId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-8">
                            <div>
                                <Label className="py-2 text-xl" htmlFor="title">Title</Label>
                                <p className="text-muted-foreground text-sm mb-2">Enter the title of the property. This will be displayed to users before they click on a property. It should include the address, property type, and other relevant information.</p>
                                <Input
                                    id="title"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="ml-2"
                                />
                            </div>

                            <div>
                                <Label className="py-2 text-xl" htmlFor="address">Address</Label>

                                <div className="ml-2 w-3/4">
                                    <Label className="py-2 text-sm" htmlFor="address">Address Line 1</Label>
                                    <Input
                                        id="address"
                                        placeholder="Address Line 1"
                                        value={address?.address_line_1 || ""}
                                        onChange={(e) => setAddress(address ? { ...address, address_line_1: e.target.value } : { address_line_1: e.target.value, address_line_2: null, city: "", post_code: "" })}
                                    />

                                    <Label className="py-2 text-sm" htmlFor="address2">Address Line 2</Label>
                                    <Input
                                        id="address2"
                                        placeholder="Address Line 2"
                                        value={address?.address_line_2 || ""}
                                        onChange={(e) => setAddress(address ? { ...address, address_line_2: e.target.value } : { address_line_1: "", address_line_2: e.target.value, city: "", post_code: "" })}
                                    />

                                    <Label className="py-2 text-sm" htmlFor="postCode">Post Code</Label>
                                    <Input
                                        id="postCode"
                                        placeholder="Post Code"
                                        value={address?.post_code || ""}
                                        onChange={(e) => setAddress(address ? { ...address, post_code: e.target.value } : { address_line_1: "", address_line_2: "", city: "", post_code: e.target.value })}
                                    />

                                    <Label className="py-2 text-sm" htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        placeholder="City"
                                        value={address?.city || ""}
                                        onChange={(e) => setAddress(address ? { ...address, city: e.target.value } : { address_line_1: "", address_line_2: "", city: e.target.value, post_code: "" })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="py-2 text-xl" htmlFor="features">Key Features</Label>
                                <p className="text-muted-foreground text-sm mb-2">Enter the key features of the property. These will be displayed as bullet points on the property details page.</p>
                                <div className="w-3/4">
                                    {features.map((feature, index) => (
                                        <InputGroup key={index} className="mb-2 ml-2">
                                            <InputGroupInput
                                                placeholder={`Feature ${index + 1}`}
                                                value={feature}
                                                onChange={(e) => {
                                                    const newFeatures = [...features];
                                                    newFeatures[index] = e.target.value;
                                                    setFeatures(newFeatures);
                                                }}
                                                className="flex-1 border-none"
                                            />
                                            <InputGroupAddon className="flex flex-col gap-2" align={"inline-end"}>
                                                <InputGroupButton size={"icon-xs"} onClick={() => removeFeature(index, features, setFeatures)}> <X /></InputGroupButton>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    ))}
                                    <div className="flex justify-end">
                                        <Button type="button" className="bg-buttonColor hover:bg-buttonColor/90 ml-2 text-foreground inline-flex" onClick={() => setFeatures([...features, ""])}>Add Feature <PlusCircleIcon /></Button>
                                    </div>
                                </div>
                            </div>

                            <div >
                                <Label className="py-2 text-xl" htmlFor="description">Description</Label>
                                <p className="text-muted-foreground text-sm mb-2">Provide a detailed description of the property, highlighting all important features.</p>
                                <InputGroup className="ml-2">
                                    <InputGroupTextarea
                                        id="description"
                                        placeholder="Enter your message"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="h-32"
                                    />
                                </InputGroup>
                            </div>

                            <div>
                                <Label className="py-2 text-xl" htmlFor="price">Price</Label>
                                <InputGroup className="ml-2">
                                    <InputGroupAddon >£</InputGroupAddon>
                                    <InputGroupInput
                                        id="price"
                                        placeholder="Price"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </InputGroup>

                                <Label className="py-2 text-sm" htmlFor="price">Price Type</Label>
                                <InputGroup className="ml-2">
                                    <InputGroupAddon >£</InputGroupAddon>
                                    <InputGroupInput
                                        id="priceType"
                                        placeholder="Price Type (e.g. Offers Over, Fixed Price)"
                                        value={priceType}
                                        onChange={(e) => setPriceType(e.target.value)}
                                    />
                                </InputGroup>
                            </div>

                            <div>
                                <Label className="py-2 text-xl" htmlFor="features">Features</Label>

                                <div className="grid grid-cols-3 gap-4 mx-2">
                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">EPC Rating:</Label>
                                        <Input
                                            id="epcRating"
                                            placeholder="EPC Rating"
                                            value={epc}
                                            onChange={(e) => setEpc(e.target.value)}
                                            className="ml-2 w-[40px]"
                                            maxLength={1}
                                        />

                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Council Tax Band:</Label>
                                        <Input
                                            id="councilTaxBand"
                                            placeholder="Council Tax Band"
                                            value={councilTaxBand}
                                            onChange={(e) => setCouncilTaxBand(e.target.value)}
                                            className="ml-2 w-[40px]"
                                            maxLength={1}
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Number of Bedrooms:</Label>
                                        <Input
                                            id="numBedrooms"
                                            placeholder="Number of Bedrooms"
                                            value={numBedrooms}
                                            onChange={(e) => setNumBedrooms(e.target.value)}
                                            className="ml-2 w-[40px]"
                                            maxLength={2}
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Number of Bathrooms:</Label>
                                        <Input
                                            id="numBathrooms"
                                            placeholder="Number of Bathrooms"
                                            value={numBathrooms}
                                            onChange={(e) => setNumBathrooms(e.target.value)}
                                            className="ml-2 w-[40px]"
                                            maxLength={2}
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Property Type:</Label>
                                        <Input
                                            id="propertyType"
                                            placeholder="Property Type"
                                            value={propertyType}
                                            onChange={(e) => setPropertyType(e.target.value)}
                                            className="ml-2"
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Square Feet:</Label>
                                        <Input
                                            id="squareFeet"
                                            placeholder="Square Feet"
                                            value={squareFeet}
                                            onChange={(e) => setSquareFeet(e.target.value)}
                                            className="ml-2 w-[70px]"
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Garage:</Label>
                                        <Input
                                            id="garage"
                                            type="checkbox"
                                            checked={garage}
                                            onChange={(e) => setGarage(e.target.checked)}
                                            className="ml-2 w-[20px]"
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">New Build:</Label>
                                        <Input
                                            id="newBuild"
                                            type="checkbox"
                                            checked={newBuild}
                                            onChange={(e) => setNewBuild(e.target.checked)}
                                            className="ml-2 w-[20px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="py-2 text-2xl">Images</Label>
                                <EditImages params={{ id: propertyId }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Button type="submit" className="bg-buttonColor hover:bg-buttonHover mt-4 text-foreground fixed bottom-4 right-4 text-lg w-48 h-12">Save Changes</Button>
            </form>
        </div>
    );
}
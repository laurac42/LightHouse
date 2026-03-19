import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import LoadingDialog from "@/components/dialogs/loading-dialog";
import ErrorDialog from "@/components/dialogs/error-dialog";
import SuccessDialog from "@/components/dialogs/success-dialog";
import { AddableProperty } from "@/types/property";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { removeFeatureAddable } from "@/lib/data/edit-property";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea, InputGroupButton } from "@/components/ui/input-group";
import { PlusCircleIcon, Pencil, CirclePlus } from "lucide-react";
import EditImages, { StagedFiles } from "./edit-images";
import { addProperty } from "@/lib/data/add-property";

export default function AddPropertyForm({ role, id }: { role: "admin" | "estate-agent"; id: string }) {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [stagedImages, setStagedImages] = useState<StagedFiles>();
    const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);

    const [propertyData, setPropertyData] = useState<AddableProperty>({
        title: "",
        description: "",
        address_line_1: "",
        address_line_2: "",
        post_code: "",
        city: "",
        price: 0,
        price_type: null,
        epc_rating: "",
        council_tax_band: "",
        num_bedrooms: 0,
        num_bathrooms: 0,
        property_type: "",
        square_feet: 0,
        has_garage: false,
        is_new_build: false,
        features: [],
        status: "draft",
    });

    // handle form submission to add a new property to the database
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            await addProperty({ ...propertyData, status:"active" }, id);
            setSuccessMessage("Property added successfully.");
        } catch (error) {
            setErrorMessage("An error occurred while adding the property. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // handle saving a draft of the property (same as submitting but with status set to draft and without validating required fields)
    async function saveDraft() {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            await addProperty({ ...propertyData, status: "draft" }, id);
            setSuccessMessage("Draft saved successfully.");
        } catch (error) {
            setErrorMessage("An error occurred while saving the draft. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <LoadingDialog loading={loading} page={"Editing"} />
            <ErrorDialog message={errorMessage || ""} page={"Editing"} setMessage={(message) => setErrorMessage(message || "")} />
            <SuccessDialog message={successMessage || ""} page={"Editing"} role={role === "estate-agent" ? "estate-agent" : "admin"} setSuccessMessage={(message) => setSuccessMessage(message || "")} />

            <form onSubmit={handleSubmit}>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Add Property</CardTitle>
                        <CardDescription>
                            Add a new property to the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-8">
                            <div>
                                <Label className="py-2 text-xl" htmlFor="title">Title</Label>
                                <p className="text-muted-foreground text-sm mb-2">Enter the title of the property. This will be displayed to users before they click on a property. It should include the address, property type, and other relevant information.</p>
                                <Input
                                    id="title"
                                    placeholder="Title"
                                    value={propertyData.title}
                                    onChange={(e) => setPropertyData({ ...propertyData, title: e.target.value })}
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
                                        value={propertyData?.address_line_1 || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, address_line_1: e.target.value })}
                                        required
                                    />

                                    <Label className="py-2 text-sm" htmlFor="address2">Address Line 2</Label>
                                    <Input
                                        id="address2"
                                        placeholder="Address Line 2"
                                        value={propertyData?.address_line_2 || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, address_line_2: e.target.value })}
                                    />

                                    <Label className="py-2 text-sm" htmlFor="postCode">Post Code</Label>
                                    <Input
                                        id="postCode"
                                        placeholder="Post Code"
                                        value={propertyData?.post_code || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, post_code: e.target.value })}
                                        required
                                    />

                                    <Label className="py-2 text-sm" htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        placeholder="City"
                                        value={propertyData?.city || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="py-2 text-xl" htmlFor="features">Key Features</Label>
                                <p className="text-muted-foreground text-sm mb-2">Enter the key features of the property. These will be displayed as bullet points on the property details page.</p>
                                <div className="w-3/4">
                                    {propertyData.features && propertyData.features.map((feature, index) => (
                                        <InputGroup key={index} className="mb-2 ml-2">
                                            <InputGroupInput
                                                placeholder={`Feature ${index + 1}`}
                                                value={feature}
                                                onChange={(e) => {
                                                    const newFeatures = [...(propertyData.features || [])];
                                                    newFeatures[index] = e.target.value;
                                                    setPropertyData({ ...propertyData, features: newFeatures });
                                                }}
                                                className="flex-1 border-none"
                                            />
                                            <InputGroupAddon className="flex flex-col gap-2" align={"inline-end"}>
                                                <InputGroupButton size={"icon-xs"} onClick={() => propertyData.features && removeFeatureAddable(index, propertyData.features, setPropertyData)}> <X /></InputGroupButton>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    ))}
                                    <div className="flex justify-end">
                                        <Button type="button" className="bg-buttonColor hover:bg-buttonColor/90 ml-2 text-foreground inline-flex" onClick={() => setPropertyData({ ...propertyData, features: [...(propertyData.features || []), ""] })}>Add Feature <PlusCircleIcon /></Button>
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
                                        value={propertyData?.description || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                                        className="h-32"
                                        required
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
                                        value={propertyData?.price || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, price: parseFloat(e.target.value) })}
                                        required
                                    />
                                </InputGroup>

                                <Label className="py-2 text-sm" htmlFor="price">Price Type</Label>
                                <InputGroup className="ml-2">
                                    <InputGroupAddon >£</InputGroupAddon>
                                    <InputGroupInput
                                        id="priceType"
                                        placeholder="Price Type (e.g. Offers Over, Fixed Price)"
                                        value={propertyData?.price_type || ""}
                                        onChange={(e) => setPropertyData({ ...propertyData, price_type: e.target.value })}
                                        required
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
                                            placeholder="C"
                                            value={propertyData?.epc_rating || ""}
                                            onChange={(e) => setPropertyData({ ...propertyData, epc_rating: e.target.value })}
                                            className="ml-2 w-[40px]"
                                            maxLength={1}
                                        />

                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Council Tax Band:</Label>
                                        <Input
                                            id="councilTaxBand"
                                            placeholder="B"
                                            value={propertyData?.council_tax_band || ""}
                                            onChange={(e) => setPropertyData({ ...propertyData, council_tax_band: e.target.value })}
                                            className="ml-2 w-[40px]"
                                            maxLength={1}
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Number of Bedrooms:</Label>
                                        <Input
                                            id="numBedrooms"
                                            placeholder="0"
                                            value={propertyData?.num_bedrooms || ""}
                                            onChange={(e) => setPropertyData({ ...propertyData, num_bedrooms: parseInt(e.target.value) })}
                                            className="ml-2 w-[40px]"
                                            maxLength={2}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Number of Bathrooms:</Label>
                                        <Input
                                            id="numBathrooms"
                                            placeholder="0"
                                            value={propertyData?.num_bathrooms || ""}
                                            onChange={(e) => setPropertyData({ ...propertyData, num_bathrooms: parseInt(e.target.value) })}
                                            className="ml-2 w-[40px]"
                                            maxLength={2}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Property Type:</Label>
                                        <Input
                                            id="propertyType"
                                            placeholder="Property Type"
                                            value={propertyData?.property_type || ""}
                                            onChange={(e) => setPropertyData({ ...propertyData, property_type: e.target.value })}
                                            className="ml-2"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Square Feet:</Label>
                                        <Input
                                            id="squareFeet"
                                            placeholder="Sq Ft"
                                            value={propertyData?.square_feet || ""}
                                            onChange={(e) => setPropertyData({ ...propertyData, square_feet: parseInt(e.target.value) })}
                                            className="ml-2 w-[70px]"
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">Garage:</Label>
                                        <Input
                                            id="garage"
                                            type="checkbox"
                                            checked={propertyData?.has_garage || false}
                                            onChange={(e) => setPropertyData({ ...propertyData, has_garage: e.target.checked })}
                                            className="ml-2 w-[20px]"
                                        />
                                    </div>

                                    <div className="flex flex row items-center">
                                        <Label className="py-2 text-sm" htmlFor="features">New Build:</Label>
                                        <Input
                                            id="newBuild"
                                            type="checkbox"
                                            checked={propertyData?.is_new_build || false}
                                            onChange={(e) => setPropertyData({ ...propertyData, is_new_build: e.target.checked })}
                                            className="ml-2 w-[20px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="py-2 text-2xl">Images</Label>
                                <EditImages
                                    params={{ id: null }}
                                    onStagedFilesChange={setStagedImages}
                                    onDeletedImagesChange={setImagesMarkedForDeletion}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row justify-end mt-6 gap-4">
                            <div className="flex justify-end mt-6">
                                <Button onClick={saveDraft} type="button" className="bg-midBlue hover:bg-midBlue/90 text-foreground text-lg p-6">Save Draft <Pencil /></Button>
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button type="submit" className="bg-buttonColor hover:bg-buttonColor/90 text-foreground text-lg p-6">Add Property <CirclePlus /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
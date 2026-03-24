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
import { Button } from "./ui/button";
import EditImages, { type StagedFiles } from "./edit-images";
import { deleteImageFromStorage, getNextIndexInCategory, uploadImageToStorage } from "@/lib/data/images";
import { editProperty, removeFeatureEditable } from "@/lib/data/edit-property";
import ErrorDialog from "./dialogs/error-dialog";
import LoadingDialog from "./dialogs/loading-dialog";
import SuccessDialog from "./dialogs/success-dialog";
import { EditableProperty } from "@/types/property";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { isSellerByEmail } from "@/lib/auth/role";
import { getIdByEmail, getEmailById } from "@/lib/auth/user";
import { addImageUrlToProperty } from "@/lib/data/add-property";

export default function EditPropertyForm({ propertyId, role }: { propertyId: number, role: string }) {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [stagedImages, setStagedImages] = useState<StagedFiles>();
    const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);
    const [property, setProperty] = useState<EditableProperty | null>(null);
    const [sellerEmail, setSellerEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const property = await fetchPropertyDetails(propertyId);
                if (property) {
                    setProperty(property);
                    if (property.seller_id) {
                        const email = await getEmailById(property.seller_id);
                        if (email) {
                            setSellerEmail(email.email);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching property details", error);
                setErrorMessage("Failed to fetch property details: " + error);
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

            let sellerId: string | null = null;
            if (sellerEmail && sellerEmail !== null) {
                sellerId = await getSellerIdFromEmail();
                if (!sellerId) {
                    setLoading(false);
                    return;
                }
            }
            await editProperty(propertyId, {
                ...property,
                last_updated_at: new Date().toISOString(),
                seller_id: sellerId || null
            });

            if (stagedImages && propertyId) {
                await addImageUrlToProperty(propertyId);
                for (const [category, files] of Object.entries(stagedImages)) {
                    let nextIndex = await getNextIndexInCategory(category, propertyId)
                    for (const file of files) {
                        nextIndex++;
                        const path = `${category}_${nextIndex}`;
                        await uploadImageToStorage(propertyId, file, path)
                    }
                }
            }

            if (imagesMarkedForDeletion.length > 0) {
                for (const filename of imagesMarkedForDeletion) {
                    await deleteImageFromStorage(propertyId, filename);
                }
            }

            setImagesMarkedForDeletion([]);

            setSuccessMessage("Property details updated successfully!");
            setErrorMessage(null);

        } catch (error) {
            console.error("Error updating property", error);
            setErrorMessage("Failed to update property details: " + error);
            setSuccessMessage(null);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Get the ID of a seller from their email address to link them to the property. This will allow the seller to add additional details to the property listing.
     * The function checks if the provided email corresponds to a registered seller and if so, fetches their ID and updates the property data with the seller ID.
     * @returns The seller Id, or null if the email is null, or false if the email does not correspond to a valid seller
     */
    async function getSellerIdFromEmail() {
        if (sellerEmail === null) {
            return null;
        }
        try {
            const isSeller = await isSellerByEmail(sellerEmail);
            if (!isSeller) {
                setErrorMessage("The provided email does not correspond to a seller.");
                setLoading(false);
                return null;
            }
            const sellerId = await getIdByEmail(sellerEmail);
            return sellerId.id;
        } catch (error) {
            setErrorMessage("Unable to validate seller email. Please try again.");
            setLoading(false);
            return null;
        }
    }

    return (
        <div>
            <LoadingDialog loading={loading} page={"Editing"} />
            <ErrorDialog message={errorMessage || ""} page={"Editing"} setMessage={(message) => setErrorMessage(message || "")} />
            <SuccessDialog message={successMessage || ""} page={"Editing"} role={role === "estate-agent" ? "estate-agent" : "admin"} setSuccessMessage={setSuccessMessage} />

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/90 border-none">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Edit Property with ID: {propertyId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {property ? (
                            <div className="flex flex-col gap-8">

                                <div>
                                    <Field>
                                        <FieldLabel className="text-xl">Link a Seller</FieldLabel>
                                        <InputGroup className="ml-2 w-max cursor-pointer">
                                            <InputGroupInput
                                                id="sellerEmail"
                                                placeholder="Seller's Email"
                                                value={sellerEmail ?? ""}
                                                onChange={e => setSellerEmail(e.target.value || null)}
                                                className="border-none cursor-pointer"
                                            />
                                        </InputGroup>
                                        <FieldDescription className="pt-0 mt-0 ml-2">
                                            Optionally, you can link a seller to the property by entering their email address. This will allow the seller to add additional details to the property listing. The seller will not be able to edit the property details, however will be able to add additional information which will be visible to buyers.
                                            <br /><br />
                                            To register a seller, please go to <a href="/estate-agent/portal/manage-sellers" target="_blank" className="text-blue-500 underline">Portal -&gt; Manage Sellers</a> and click on the "Add Seller" button. Once the seller is registered, you can return to this form and enter their email address to link them to the property.
                                        </FieldDescription>
                                    </Field>
                                </div>

                                <div>
                                    <Label className="py-2 text-xl" htmlFor="title">Title</Label>
                                    <p className="text-muted-foreground text-sm mb-2">Enter the title of the property. This will be displayed to users before they click on a property. It should include the address, property type, and other relevant information.</p>
                                    <Input
                                        id="title"
                                        placeholder="Title"
                                        value={property.title}
                                        onChange={(e) => setProperty({ ...property, title: e.target.value })}
                                        className="ml-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="py-2 text-xl" htmlFor="address">Address</Label>

                                    <div className="ml-2 w-3/4">
                                        <Label className="py-2 text-sm" htmlFor="address">Address Line 1</Label>
                                        <Input
                                            id="address"
                                            placeholder="Address Line 1"
                                            value={property?.address_line_1 || ""}
                                            onChange={(e) => setProperty(property ? { ...property, address_line_1: e.target.value } : null)}
                                            required
                                        />

                                        <Label className="py-2 text-sm" htmlFor="address2">Address Line 2</Label>
                                        <Input
                                            id="address2"
                                            placeholder="Address Line 2"
                                            value={property?.address_line_2 || ""}
                                            onChange={(e) => setProperty(property ? { ...property, address_line_2: e.target.value } : null)}
                                        />

                                        <Label className="py-2 text-sm" htmlFor="postCode">Post Code</Label>
                                        <Input
                                            id="postCode"
                                            placeholder="Post Code"
                                            value={property?.post_code || ""}
                                            onChange={(e) => setProperty(property ? { ...property, post_code: e.target.value } : null)}
                                            required
                                        />

                                        <Label className="py-2 text-sm" htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            placeholder="City"
                                            value={property?.city || ""}
                                            onChange={(e) => setProperty(property ? { ...property, city: e.target.value } : null)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="py-2 text-xl" htmlFor="features">Key Features</Label>
                                    <p className="text-muted-foreground text-sm mb-2">Enter the key features of the property. These will be displayed as bullet points on the property details page.</p>
                                    <div className="w-3/4">
                                        {property.features && property.features.map((feature, index) => (
                                            <InputGroup key={index} className="mb-2 ml-2">
                                                <InputGroupInput
                                                    placeholder={`Feature ${index + 1}`}
                                                    value={feature}
                                                    onChange={(e) => {
                                                        const newFeatures = [...(property.features || [])];
                                                        newFeatures[index] = e.target.value;
                                                        setProperty({ ...property, features: newFeatures });
                                                    }}
                                                    className="flex-1 border-none"
                                                />
                                                <InputGroupAddon className="flex flex-col gap-2" align={"inline-end"}>
                                                    <InputGroupButton size={"icon-xs"} onClick={() => property.features && removeFeatureEditable(index, property.features, setProperty)}> <X /></InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        ))}
                                        <div className="flex justify-end">
                                            <Button type="button" className="bg-buttonColor hover:bg-buttonColor/90 ml-2 text-foreground inline-flex" onClick={() => setProperty({ ...property, features: [...(property.features || []), ""] })}>Add Feature <PlusCircleIcon /></Button>
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
                                            value={property?.description || ""}
                                            onChange={(e) => setProperty(property ? { ...property, description: e.target.value } : null)}
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
                                            value={property?.price || ""}
                                            onChange={(e) => setProperty(property ? { ...property, price: parseFloat(e.target.value) } : null)}
                                            required
                                        />
                                    </InputGroup>

                                    <Label className="py-2 text-sm" htmlFor="price">Price Type</Label>
                                    <InputGroup className="ml-2">
                                        <InputGroupAddon >£</InputGroupAddon>
                                        <InputGroupInput
                                            id="priceType"
                                            placeholder="Price Type (e.g. Offers Over, Fixed Price)"
                                            value={property?.price_type || ""}
                                            onChange={(e) => setProperty(property ? { ...property, price_type: e.target.value } : null)}
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
                                                placeholder="EPC Rating"
                                                value={property?.epc_rating || ""}
                                                onChange={(e) => setProperty(property ? { ...property, epc_rating: e.target.value } : null)}
                                                className="ml-2 w-[40px]"
                                                maxLength={1}
                                            />

                                        </div>

                                        <div className="flex flex row items-center">
                                            <Label className="py-2 text-sm" htmlFor="features">Council Tax Band:</Label>
                                            <Input
                                                id="councilTaxBand"
                                                placeholder="Council Tax Band"
                                                value={property?.council_tax_band || ""}
                                                onChange={(e) => setProperty(property ? { ...property, council_tax_band: e.target.value } : null)}
                                                className="ml-2 w-[40px]"
                                                maxLength={1}
                                            />
                                        </div>

                                        <div className="flex flex row items-center">
                                            <Label className="py-2 text-sm" htmlFor="features">Number of Bedrooms:</Label>
                                            <Input
                                                id="numBedrooms"
                                                placeholder="Number of Bedrooms"
                                                value={property?.num_bedrooms || ""}
                                                onChange={(e) => setProperty(property ? { ...property, num_bedrooms: parseInt(e.target.value) } : null)}
                                                className="ml-2 w-[40px]"
                                                maxLength={2}
                                                required
                                            />
                                        </div>

                                        <div className="flex flex row items-center">
                                            <Label className="py-2 text-sm" htmlFor="features">Number of Bathrooms:</Label>
                                            <Input
                                                id="numBathrooms"
                                                placeholder="Number of Bathrooms"
                                                value={property?.num_bathrooms || ""}
                                                onChange={(e) => setProperty(property ? { ...property, num_bathrooms: parseInt(e.target.value) } : null)}
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
                                                value={property?.property_type || ""}
                                                onChange={(e) => setProperty(property ? { ...property, property_type: e.target.value } : null)}
                                                className="ml-2"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex row items-center">
                                            <Label className="py-2 text-sm" htmlFor="features">Square Feet:</Label>
                                            <Input
                                                id="squareFeet"
                                                placeholder="Square Feet"
                                                value={property?.square_feet || ""}
                                                onChange={(e) => setProperty(property ? { ...property, square_feet: parseInt(e.target.value) } : null)}
                                                className="ml-2 w-[70px]"
                                            />
                                        </div>

                                        <div className="flex flex row items-center">
                                            <Label className="py-2 text-sm" htmlFor="features">Garage:</Label>
                                            <Input
                                                id="garage"
                                                type="checkbox"
                                                checked={property?.has_garage || false}
                                                onChange={(e) => setProperty(property ? { ...property, has_garage: e.target.checked } : null)}
                                                className="ml-2 w-[20px]"
                                            />
                                        </div>

                                        <div className="flex flex row items-center">
                                            <Label className="py-2 text-sm" htmlFor="features">New Build:</Label>
                                            <Input
                                                id="newBuild"
                                                type="checkbox"
                                                checked={property?.is_new_build || false}
                                                onChange={(e) => setProperty(property ? { ...property, is_new_build: e.target.checked } : null)}
                                                className="ml-2 w-[20px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="py-2 text-2xl">Images</Label>
                                    <EditImages
                                        params={{ id: propertyId }}
                                        onStagedFilesChange={setStagedImages}
                                        onDeletedImagesChange={setImagesMarkedForDeletion}
                                    />
                                </div>
                            </div>) : (
                            <p>Loading property details...</p>
                        )}
                    </CardContent>
                </Card>
                <Button type="submit" className="bg-buttonColor hover:bg-buttonHover mt-4 text-foreground fixed bottom-4 right-4 text-lg w-48 h-12">Save Changes</Button>
            </form>
        </div>
    );
}
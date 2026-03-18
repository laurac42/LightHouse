export function EditStatusForm({ propertyId }: { propertyId: number }) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Property Status</h1>
            {/* Form fields for editing status would go here */}
            <p>Form for editing status of property with ID: {propertyId}</p>
        </div>
    );
}
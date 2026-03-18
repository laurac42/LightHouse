import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchPropertyStatus } from "@/lib/data/property-utils";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue, SelectGroup } from "./ui/select";
import { Button } from "./ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "./ui/dialog";
import { Dialog } from "./ui/dialog";
import { editStatus } from "@/lib/data/edit-property";

const STATUSES = [
    { status: "active", description: "Active properties are available to users on the property search page" },
    { status: "under offer", description: "Under offer properties are still displayed to users, but are marked as under offer and may be filtered out of search results" },
    { status: "draft", description: "Draft properties are available to edit on the property management page, but not displayed to users" },
    { status: "completed", description: "Completed properties are no longer displayed to users on the property search page, but are still visible to the agent in the property management page for record keeping purposes" },
    { status: "withdrawn", description: "Withdrawn properties are no longer displayed to users on the property search page, but are still visible to the agent in the property management page for record keeping purposes" },
    { status: "deleted", description: "Deleted properties are no longer displayed to users on the property search page, but are still visible to the agent in the property management page for record keeping purposes" }
]

export function EditStatusForm({ propertyId }: { propertyId: number }) {
    const [status, setStatus] = useState<string>("");
    const [errorMessage, setErorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    // fetch status on page load
    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await fetchPropertyStatus(propertyId);
                setStatus(response.status);
            } catch (error) {
                setErorMessage("Error fetching property status. Please try again later.");
                console.error("Error fetching property status: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, [propertyId]);

    /**
     * Update the status in the database
     */
    async function updateStatus() {
        try {
            await editStatus(propertyId, selectedStatus);
        } catch (error) {
            setErorMessage("Error updating status " + error)
        }
    }

    return (
        <div>
            <Card className="bg-white/90 border-none">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Edit Status for Property with ID: {propertyId}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ?
                        <div>Loading status ...</div> : (
                            <div>
                                <div className="flex flex-row justify-between px-4">
                                    <div className="mt-2 mb-6 text-2xl font-bold flex flex-row">
                                        <p >Current Status: &nbsp;</p>
                                        <p className={status === "active" || status === "under offer" ? "text-green-600" : "text-red-600"}>{status}</p>
                                    </div>

                                    <div className="mt-2 mb-6 text-2xl font-bold flex flex-row pr-6">
                                        <p >Edit Status: &nbsp;</p>
                                        <Select onValueChange={(value) => setSelectedStatus(value)} required>
                                            <SelectTrigger className="border border-foreground">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {STATUSES.map(status => (
                                                        <SelectItem key={status.status} value={status.status}>{status.status}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {selectedStatus && (
                                    <div className="justify-end flex">
                                        <Button className="bg-buttonColor hover:bg-buttonColor/90 justify-end my-2 mr-8 text-lg p-4 text-foreground " onClick={() => (setOpenDialog(true))}>Update Status</Button>
                                    </div>
                                )}

                                {errorMessage &&
                                    <div className="flex justify-center">
                                        <p className="text-red-600 text-md">{errorMessage}</p>
                                    </div>
                                }

                                <Dialog open={openDialog}>
                                    <DialogContent aria-describedby="Confirm Update">
                                        <DialogHeader>
                                            <DialogTitle>Are you sure you want to continue?</DialogTitle>
                                        </DialogHeader>
                                        <p>You are going to change the property status from <span className={status === "active" || status === "under offer" ? "text-green-600" : "text-red-600"}><b>{status}</b></span> to <span className={selectedStatus === "active" || selectedStatus === "under offer" ? "text-green-600" : "text-red-600"}><b>{selectedStatus}</b></span>. Are you sure you want to continue?</p>

                                        <DialogFooter>
                                            <div className="flex flex-row gap-2 justify-between w-full">
                                                <DialogClose asChild>
                                                    <Button onClick={() => (setOpenDialog(false))} type="button" className="bg-red-400 hover:bg-red-500 justify-end my-2 text-lg text-foreground ">No, Go Back</Button>
                                                </DialogClose>

                                                <DialogClose asChild>
                                                    <Button onClick={() => { updateStatus(); setOpenDialog(false); setStatus(selectedStatus); setSelectedStatus(""); }} className="bg-green-400 hover:bg-green-500 justify-end my-2 text-lg text-foreground ">Yes, Update Status</Button>
                                                </DialogClose>
                                            </div>

                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <p className="my-2">An overview of all available statuses and their meanings is shown below. Statuses displayed to users are shown in green:</p>
                                <table className="table-auto border border-collapse border-foreground overflow-hidden outline outline-1 rounded-md w-full">
                                    <thead>
                                        <tr key={"header"}>
                                            <th className="border border-foreground bg-navBar">Status</th>
                                            <th className="border border-foreground bg-navBar">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {STATUSES.map((statusItem) => (
                                            <tr className={statusItem.status === "active" || statusItem.status === "under offer" ? "bg-green-100" : ""} key={statusItem.status}>
                                                <td className="border border-foreground text-center p-1">{statusItem.status}</td>
                                                <td className="border border-foreground p-1">{statusItem.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </CardContent>
            </Card>
        </div>
    );
}
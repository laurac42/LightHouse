import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "../ui/button";

export default function SuccessDialog({ message, page, role, setSuccessMessage }: { message: string, page: string, role: "estate-agent" | "admin", setSuccessMessage: (message: string | null) => void }) {
    return (
        <Dialog open={!!message}>
            <DialogContent aria-describedby="success">
                <DialogHeader>
                    <DialogTitle>Property Successfully {page === "Editing" ? "Edited" : "Created"}!</DialogTitle>
                </DialogHeader>
                <p className="text-green-600">{message}</p>
                <DialogFooter className="justify-end">
                    <DialogClose asChild>
                        <Button className="bg-buttonColor hover:bg-buttonColor/90 text-foreground"
                            onClick={() => {
                                setSuccessMessage(null);
                                window.location.href = `/${role}/portal/manage-properties`;
                            }}
                            type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
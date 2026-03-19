import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ErrorDialog({ message, page, setMessage }: { message: string, page: string, setMessage: (message: string | null) => void }) {
    return (
        <Dialog open={!!message}>
            <DialogContent aria-describedby="Error">
                <DialogHeader>
                    <DialogTitle>Error {page} Property</DialogTitle>
                </DialogHeader>
                <p className="text-red-600">{message}</p>
                <p>Please try again</p>
                <DialogFooter className="justify-end">
                    <DialogClose asChild >
                        <Button onClick={() => setMessage(null)} className="bg-buttonColor hover:bg-buttonColor/90 text-foreground" type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
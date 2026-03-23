import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LoadingDialog({ loading, page }: { loading: boolean, page: string }) {
    return (
        <Dialog open={loading}>
            <DialogContent aria-describedby="loading">
                <DialogHeader>
                    <DialogTitle>{page === "Editing" ? "Editing" : page === "Add" ? "Creating" : "Updating"} Property</DialogTitle>
                </DialogHeader>
                <p>Your property is being {page=== "Editing" ? "edited" : page=== "Add" ? "created" : "updated"}. Please be patient. If you are uploading images, this may take a few minutes ...</p>
            </DialogContent>
        </Dialog>
    )
}
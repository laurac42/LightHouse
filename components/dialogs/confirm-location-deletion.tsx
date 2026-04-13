import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserLocation } from "@/types/address";

export default function ConfirmLocationDeletion({ confirm, setConfirm, locationId, locations, setUserLocations }: { confirm: boolean, setConfirm: (confirm: boolean) => void, locationId: string, locations: UserLocation[] | null, setUserLocations: (locations: UserLocation[] | null) => void }) {
    const router = useRouter();
    const supabase = createClient();

    async function deleteLocation() {
        try {
            console.log("Deleting location with id: " + locationId);
            await supabase.from("user_locations").delete().eq("id", locationId);
            
            // remove from locations for instant UI refresh
            setUserLocations(locations ? locations.filter(location => location.id !== locationId) : null);

        } catch (error) {
            console.error("Error deleting location: " + error)
        }
        
    }
    return (
        <Dialog open={confirm}>
            <DialogContent aria-describedby="Confirm Deletion">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to continue?</DialogTitle>
                </DialogHeader>
                <p>You are about to permanently delete this location. Are you sure you want to continue?</p>
                <DialogFooter>
                    <div className="flex flex-row gap-4 justify-center w-full">
                        <DialogClose asChild>
                            <Button onClick={() => setConfirm(false)} type="button" className="bg-red-400 hover:bg-red-500 justify-end my-2 text-lg text-foreground">No, Go Back</Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button onClick={() => { deleteLocation(); setConfirm(false); }} className="bg-green-400 hover:bg-green-500 justify-end my-2 text-lg text-foreground ">Yes, Delete Location</Button>
                        </DialogClose>
                    </div>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

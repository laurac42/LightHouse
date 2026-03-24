import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ConfirmDeletion({ confirm, setConfirm }: { confirm: boolean, setConfirm: (confirm: boolean) => void }) {
    const router = useRouter();
    async function deleteProfile() {
        try {
            const supabase = await createClient();
            // log user out first to avoid error that they do not exist
            await supabase.auth.signOut();

            await supabase.rpc('delete_user');

            router.push("/auth/login"); 

        } catch (error) {
            console.error("Error deleting user: " + error)
        }
        
    }
    return (
        <Dialog open={confirm}>
            <DialogContent aria-describedby="Confirm Deletion">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to continue?</DialogTitle>
                </DialogHeader>
                <p>You are about to permanently delete your profile. You cannot undo this. All of your data will be removed and you will be logged out. Are you sure you want to continue?</p>
                <DialogFooter>
                    <div className="flex flex-row gap-2 justify-between w-full">
                        <DialogClose asChild>
                            <Button onClick={() => setConfirm(false)} type="button" className="bg-red-400 hover:bg-red-500 justify-end my-2 text-lg text-foreground">No, Go Back</Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button onClick={() => { deleteProfile(); setConfirm(false); }} className="bg-green-400 hover:bg-green-500 justify-end my-2 text-lg text-foreground ">Yes, Delete Profile</Button>
                        </DialogClose>
                    </div>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Heart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { validateUser } from '@/lib/auth/user';
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function NavbarDropdown() {
    const router = useRouter();
    const pathname = usePathname();

    // log the user out and redirect if necessary (if they were on a protected page)
    const logout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();

        if (!pathname.startsWith("/public")) {
            router.push("/auth/login");
        } else {
            // refresh the page to update the UI for logged out state
            await new Promise((resolve) => setTimeout(resolve, 100)); // slight delay to ensure signOut has completed
            window.location.reload();
        }
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="text-md bg-buttonColor hover:bg-buttonHover shadow-md text-foreground ">Profile<UserRound className="w-4 h-4 ml-2" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[200]">
                <DropdownMenuGroup>
                    <DropdownMenuItem><Link href="/protected/profile">My Account</Link></DropdownMenuItem>
                    <DropdownMenuItem><Link href="/protected/favourites" className="inline-flex items-center">Favourites <Heart className="w-4 h-4 ml-2 fill-current text-buttonColor" /></Link></DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={logout}>
                        Logout <LogOut className="w-4 h-4 ml-2" />
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
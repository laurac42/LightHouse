'use client';

import { UserRound, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { validateUser } from '@/lib/auth/user';
import { isAdmin } from '@/lib/auth/role';


export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userIsAdmin, setUserIsAdmin] = useState(false);

    useEffect(() => {

        async function checkAuthStatus() {
            try {
                let user = await validateUser();
                setIsLoggedIn(!!user);

                if (user) {
                    const adminStatus = await isAdmin();
                    setUserIsAdmin(adminStatus);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsLoggedIn(false);
                setUserIsAdmin(false);
            }

        }
        checkAuthStatus();
    }, []);

    return (
        <nav className="w-full bg-navBar">
            <div className="shadow-sm shadow-highlight mx-auto px-4 py-3 flex items-center justify-between">
                <div className="md:hidden text-2xl text-foreground cursor-pointer">
                    <Menu onClick={() => setIsMenuOpen(!isMenuOpen)} />
                </div>
                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 md:hidden z-40" onClick={() => setIsMenuOpen(false)} />
                )}
                {/* Mobile Menu Drawer */}
                {isMenuOpen && (
                    <div className="fixed top-0 left-0 h-screen w-1/2 bg-navBar md:hidden flex flex-col space-y-4 p-6 z-50 shadow-lg overflow-y-auto">
                        <div className="flex flex-row items-center mb-6 gap-4">
                            <div className="flex flex-row items-center">
                                <p className="text-4xl font-extrabold font-fuggles">L</p>
                                <p className="text-lg font-bold">ightHouse</p>
                            </div>
                            <X onClick={() => setIsMenuOpen(false)} />
                        </div>
                        <a href="#" className="text-foreground text-lg">Home</a>
                        <a href="#" className="text-foreground text-lg">Buy</a>
                        <a href="#" className="text-foreground text-lg">Sell</a>
                        <a href="#" className="text-foreground text-lg">Estate Agents</a>
                        {isLoggedIn && userIsAdmin && (
                            <a href="/admin/portal" className="text-foreground text-lg">Admin Portal</a>
                        )}
                    </div>
                )}
                <div className="pl-4 flex flex-row items-center">
                    <img src="/images/logo.png" alt="LightHouse Logo" className="w-11 h-11"></img>
                    <p className="text-4xl font-extrabold font-fuggles">L</p>
                    <p className="text-lg font-bold">ightHouse</p>
                </div>
                <div className="flex flex-row gap-6">
                    <a href="/" className="hidden md:flex text-foreground hover:text-foregroundHover hover:underline">Buy</a>
                    <a href="/" className="hidden md:flex text-foreground hover:text-foregroundHover hover:underline">Sell</a>
                    <a href="/" className="hidden md:flex text-foreground hover:text-foregroundHover hover:underline">Estate Agents</a>
                </div>
                {/* Desktop action buttons */}
                <div className="hidden md:flex items-center gap-2">
                    {(isLoggedIn && userIsAdmin) && (
                        <Link href="/admin/portal">
                            <Button type="button" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Admin Portal</Button>
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <Link href="/">
                            <Button type="button" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Profile <UserRound className="w-4 h-4 ml-2" /></Button>
                        </Link>
                    ) : (
                        <Link href="/auth/login">
                            <Button type="button" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Sign In<UserRound className="w-4 h-4 ml-2" /></Button>
                        </Link>
                    )}
                </div>
                {/* Mobile action buttons */}
                <div className="md:hidden flex items-center gap-2">
                    {isLoggedIn ? (
                        <Link href="/" className='text-2xl'>
                            <UserRound />
                        </Link>
                    ) : (
                        <Link href="/auth/login" className='text-2xl'>
                            <UserRound />
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCircleUser, faX } from '@fortawesome/free-solid-svg-icons'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {

        async function checkAuthStatus() {
            const supabase = await createClient();
            const { data } = await supabase.auth.getSession();
            setIsLoggedIn(!!data?.session);
        }
        checkAuthStatus();

    }, []);

    return (
        <nav className="w-full bg-navBar">
            <div className="shadow-md shadow-highlight mx-auto px-4 py-3 flex items-center justify-between">
                <div className="md:hidden text-2xl text-foreground cursor-pointer">
                    <FontAwesomeIcon icon={faBars} onClick={() => setIsMenuOpen(!isMenuOpen)} />
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
                            <FontAwesomeIcon icon={faX} onClick={() => setIsMenuOpen(false)} />
                        </div>
                        <a href="#" className="text-foreground text-lg">Home</a>
                        <a href="#" className="text-foreground text-lg">Buy</a>
                        <a href="#" className="text-foreground text-lg">Sell</a>
                        <a href="#" className="text-foreground text-lg">Estate Agents</a>
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
                {/* Sign in button for desktop */}
                <div className="hidden md:flex">
                    {isLoggedIn ? (
                        <Link href="/">
                            <Button type="button" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Profile <FontAwesomeIcon icon={faCircleUser} /></Button>
                        </Link>
                    ) : (
                        <Link href="/auth/login">
                            <Button type="button" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-md">Sign In<FontAwesomeIcon icon={faCircleUser} /></Button>
                        </Link>
                    )}
                </div>
                {/* Sign in button for mobile */}
                <div className="md:hidden">
                    {isLoggedIn ? (
                        <Link href="/" className='text-2xl'>
                            <FontAwesomeIcon icon={faCircleUser} />
                        </Link>
                    ) : (
                        <Link href="/auth/login" className='text-2xl'>
                            <FontAwesomeIcon icon={faCircleUser} />
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
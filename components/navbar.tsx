'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            <div className="shadow-xl shadow-highlight container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="pl-4 flex flex-row items-center">
                    <img src="/images/logo.png" alt="LightHouse Logo" className="w-11 h-11"></img>
                    <p className="text-4xl font-extrabold font-fuggles">L</p>
                    <p className="text-lg font-bold">ightHouse</p>
                </div>
                <div className="space-x-4">
                    <a href="/" className="text-foreground hover:text-foregroundHover hover:underline">Buy</a>
                    <a href="/about" className="text-foreground hover:text-foregroundHover hover:underline">Sell</a>
                    <a href="/contact" className="text-foreground hover:text-foregroundHover hover:underline">Estate Agents</a>
                </div>
                <div>
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
            </div>
        </nav>
    );
}
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function AcceptInviteForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | null = null;

        // init function to handle the token exchange and set the email 
        const init = async () => {
            const supabase = await createClient();

            // manually parse and exchange the hash tokens
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                // set the session in Supabase so that the user is authenticated
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
                if (data.session?.user) {
                    setEmail(data.session.user.email || '');
                }
            }
        };

        init();
    }, []);

    // handle the form submission to set the user's password and mark the invite as accepted
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        if (password !== repeatPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password,
                data: {
                    invited: false, // Mark the user as having accepted the invite
                },
            });
            if (error) throw error;

            router.push("/auth/sign-up-success");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="bg-white/90 border-none">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to LightHouse</CardTitle>
                    <CardDescription>You have been invited to join the platform. Please create an account to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSetPassword}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <p>Email: {email}</p>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border border-border"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="repeat-password">Repeat Password</Label>
                                </div>
                                <Input
                                    id="repeat-password"
                                    type="password"
                                    required
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    className="border border-border"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-xl" disabled={isLoading}>
                                {isLoading ? "Creating an account..." : "Sign up"}
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm text-highlight">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="underline underline-offset-4">
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

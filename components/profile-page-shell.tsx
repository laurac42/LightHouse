"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/navbar";
import ProfileSectionNav from "@/components/profile-section-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProfilePageShellProps = {
    title: string;
    description: string;
    isAdminOrAgent: boolean;
    children: ReactNode;
};

export default function ProfilePageShell({
    title,
    description,
    isAdminOrAgent,
    children,
}: ProfilePageShellProps) {
    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full p-6 md:p-10">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-8">
                                <ProfileSectionNav isAdminOrAgent={isAdminOrAgent} />
                                <div className="flex-1">{children}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

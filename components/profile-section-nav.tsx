"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ProfileSectionNavProps = {
    isAdminOrAgent: boolean;
};

export default function ProfileSectionNav({ isAdminOrAgent }: ProfileSectionNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const sections = [
        { label: "Profile", href: "/protected/profile" },
        { label: "Goals", href: "/protected/profile/goals", hidden: isAdminOrAgent },
        { label: "Preferences", href: "/protected/profile/preferences", hidden: isAdminOrAgent },
        { label: "My Locations", href: "/protected/profile/locations", hidden: isAdminOrAgent },
    ].filter((section) => !section.hidden);

    return (
        <div className="flex flex-row md:flex-col">
            {sections.map((section) => {
                const isActive = pathname === section.href;

                return (
                    <Button
                        key={section.href}
                        onClick={() => router.push(section.href)}
                        variant={"ghost"}
                        className={`rounded-none border-b-2 px-3 ${isActive
                            ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                            }`}
                    >
                        {section.label}
                    </Button>
                );
            })}
        </div>
    );
}

'use client';

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export default function PortalMenu({ role }: { role: "admin" | "estate-agent" }) {
  const router = useRouter();
  const pathname = usePathname();


  const menuOptions = role === "admin" ? [
    { label: "Overview", href: "/admin/portal" },
    { label: "Manage Properties", href: "/admin/portal/manage-properties" },
    { label: "Manage Estate Agents", href: "/admin/portal/manage-estate-agents" },
  ] : [
    { label: "Overview", href: "/estate-agent/portal" },
    { label: "Manage Properties", href: "/estate-agent/portal/manage-properties" },
    { label: "Manage Sellers", href: "/estate-agent/portal/manage-sellers" },
  ];

  return (
    <div className="border-b">
      <nav className="flex flex-wrap gap-2">
        {menuOptions.map((option) => {
          const isActive = pathname === option.href;

          return (
            <Button
              key={option.href}
              variant="ghost"
              onClick={() => router.push(option.href)}
              className={`rounded-none border-b-2 px-3 ${isActive
                ? "border-buttonColor text-foreground hover:bg-buttonColor/70"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-buttonColor/70"
                }`}
            >
              {option.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
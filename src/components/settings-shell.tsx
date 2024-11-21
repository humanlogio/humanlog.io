import { PropsWithChildren } from "react";
import Link from "next/link";
import {
  getUserSettingsUrl,
  getOrgSettingsUrl,
  getEnvSettingsUrl,
} from "@/lib/utils/navigation";
import { cn } from "@/lib/utils";
import { Building, CodeSquareIcon, Loader, User } from "lucide-react";

interface SettingsShellProps {
  activeSection: "user" | "organization" | "environment";
  orgName?: string;
  envName?: string;
}

export function SettingsShell({
  activeSection,
  orgName,
  envName,
  children,
}: PropsWithChildren<SettingsShellProps>) {
  if (!orgName || !envName) {
    return (
      <div className="container-h-full container flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      name: "User Settings",
      icon: <User size={16} />,
      href: getUserSettingsUrl(),
      active: activeSection === "user",
    },
    {
      name: "Organization Settings",
      icon: <Building size={16} />,
      href: getOrgSettingsUrl(orgName),
      active: activeSection === "organization",
    },
    {
      name: "Environment Settings",
      icon: <CodeSquareIcon size={16} />,
      href: getEnvSettingsUrl(envName, orgName),
      active: activeSection === "environment",
    },
  ].filter(Boolean);

  return (
    <div className="container-h-full container flex">
      {/* Sidebar */}
      <aside className="w-80 border-r-2 border-border py-6">
        <nav className="space-y-2">
          {sections.map((section) => (
            <Link
              key={section?.name}
              href={section?.href}
              className={cn(
                "flex items-center gap-2 rounded-s-base px-4 py-2",
                section?.active
                  ? "border-r-4 border-r-main bg-slate-200"
                  : "hover:bg-slate-100",
              )}
            >
              <span
                className={section?.active ? "text-main" : "text-slate-400"}
              >
                {section?.icon}
              </span>
              <span
                className={section?.active ? "text-text" : "text-slate-400"}
              >
                {section?.name}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

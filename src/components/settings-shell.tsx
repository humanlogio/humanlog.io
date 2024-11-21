import { PropsWithChildren } from "react";
import Link from "next/link";
import {
  getUserSettingsUrl,
  getOrgSettingsUrl,
  getEnvSettingsUrl,
} from "@/lib/utils/navigation";
import { cn } from "@/lib/utils";

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
  const sections = [
    {
      name: "User Settings",
      href: getUserSettingsUrl(),
      active: activeSection === "user",
    },
    {
      name: "Organization Settings",
      href: getOrgSettingsUrl(orgName),
      active: activeSection === "organization",
    },
    {
      name: "Environment Settings",
      href: getEnvSettingsUrl(envName, orgName),
      active: activeSection === "environment",
    },
  ].filter(Boolean);

  return (
    <div className="container-h-full container flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-900">
        <nav className="space-y-2">
          {sections.map((section) => (
            <Link
              key={section?.name}
              href={section?.href}
              className={cn(
                "block rounded-md px-4 py-2",
                section?.active
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              {section?.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

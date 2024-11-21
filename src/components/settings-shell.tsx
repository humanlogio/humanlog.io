import { PropsWithChildren } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SettingsShellProps {
  activeSection: "user" | "organization" | "environment";
}

export function SettingsShell({
  activeSection,
  children,
}: PropsWithChildren<SettingsShellProps>) {
  return (
    <div className="container-h-full container flex">
      <aside className="w-64 border-r border-gray-200 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-900">
        <nav className="space-y-2">
          <Link
            href="/settings/user"
            className={cn(
              "block rounded-md px-4 py-2",
              activeSection === "user"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            User Settings
          </Link>
          <Link
            href="/settings/organization"
            className={cn(
              "block rounded-md px-4 py-2",
              activeSection === "organization"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            Organization Settings
          </Link>
          <Link
            href="/settings/environment"
            className={cn(
              "block rounded-md px-4 py-2",
              activeSection === "environment"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            Environment Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

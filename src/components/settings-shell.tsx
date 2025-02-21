"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import {
  getUserSettingsUrl,
  getOrgSettingsUrl,
  getEnvSettingsUrl,
} from "@/lib/utils/navigation";
import { cn } from "@/lib/utils";
import { Building, CodeSquareIcon, Loader, User } from "lucide-react";
import { useAllEnvironments } from "@/context/list-environments";
import { useApiClients } from "@/context/api-provider";

interface SettingsShellProps {
  activeSection: "user" | "localhost" | "organization" | "environment";
}

export function SettingsShell({
  activeSection,
  children,
}: PropsWithChildren<SettingsShellProps>) {
  const { user, localhostInfo, currentOrg, defaultOrg } = useAllEnvironments();
  const { activeEnvironment } = useApiClients();

  if (user == "not-logged-in") {
    // todo redirect to login
    return (
      <div className="container-min-h-full container flex items-center justify-center">
        <div>You need to login!</div>
      </div>
    );
  }
  if (user == "loading") {
    return (
      <div className="container-min-h-full container flex items-center justify-center">
        Checking user...
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!currentOrg) {
    // todo redirect to login
    return (
      <div className="container-min-h-full container flex items-center justify-center">
        <div>You need to login (org)</div>
        <Loader className="animate-spin" />
      </div>
    );
  }

  const orgName = currentOrg.id != defaultOrg?.id && currentOrg.name;
  const envName = activeEnvironment?.name;

  const sections = [
    {
      name: "User Settings",
      icon: <User size={16} />,
      href: getUserSettingsUrl(),
      active: activeSection === "user",
    },
  ];

  if (localhostInfo) {
    sections.push({
      name: "Localhost Settings",
      icon: <Building size={16} />,
      href: "/settings/localhost",
      active: activeSection === "localhost",
    });
  }

  if (orgName) {
    sections.push({
      name: "Organization Settings",
      icon: <Building size={16} />,
      href: getOrgSettingsUrl(orgName),
      active: activeSection === "organization",
    });
  }

  if (orgName && envName) {
    sections.push({
      name: "Environment Settings",
      icon: <CodeSquareIcon size={16} />,
      href: getEnvSettingsUrl(envName, orgName),
      active: activeSection === "environment",
    });
  }

  return (
    <div className="container-min-h-full container flex">
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

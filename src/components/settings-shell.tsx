"use client";

import { PropsWithChildren } from "react";
import { getUserSettingsUrl } from "@/lib/utils/navigation";
import {
  Building,
  CodeSquareIcon,
  User,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAllEnvironments } from "@/context/list-environments";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SettingsShellProps {
  activeSection: "user" | "localhost" | "organization";
}

export function SettingsShell({
  activeSection,
  children,
}: PropsWithChildren<SettingsShellProps>) {
  const { localhostInfo } = useAllEnvironments();

  const getSectionDetails = (section: string) => {
    switch (section) {
      case "user":
        return {
          name: "User Settings",
          icon: <User size={16} />,
          href: getUserSettingsUrl(),
        };
      case "localhost":
        return {
          name: "Localhost Settings",
          icon: <CodeSquareIcon size={16} />,
          href: "/settings/localhost",
        };
      case "organization":
        return {
          name: "Organization Settings",
          icon: <Building size={16} />,
          href: "/setting/org",
        };
    }
  };

  const currentSection = getSectionDetails(activeSection);

  return (
    <div className="p-2">
      {/* Breadcrumb Navigation */}
      <div className="border-b pb-4 pl-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/settings"
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Settings
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight size={16} />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                {currentSection?.icon}
                {currentSection?.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <main className="p-5">{children}</main>
    </div>
  );
}

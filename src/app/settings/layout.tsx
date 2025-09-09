"use client";

import { PropsWithChildren, ReactNode } from "react";
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
import { useParams, usePathname } from "next/navigation";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const getSectionDetails = (pathname: string) => {
    const path = pathname.split("/");
    const section = path[path.length - 1];

    switch (section) {
      case "users":
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
      case "org":
        return {
          name: "Organization Settings",
          icon: <Building size={16} />,
          href: "/setting/org",
        };
    }
  };

  const currentSection = getSectionDetails(pathname);

  return (
    <div className="">
      {/* Breadcrumb Navigation */}
      <div className="pl- border-b px-3 py-3">
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

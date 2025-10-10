"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Activity,
  Database,
  Bell,
  BarChart3,
  HardDrive,
  Settings,
  HexagonIcon,
  UserIcon,
} from "lucide-react";
import config from "@/features/config";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { gravatarURL } from "@/lib/utils/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { EnvSwitcher } from "@/components/header/app-header/env-switcher";
import { SideMenu } from "@/components/header/app-header/side-menu";
import { useUser } from "@/hooks/useUser";

export const localhostVersion = (res: PingResponse) => {
  const v = res.clientVersion!;
  return "v" + v.major + "." + v.minor + "." + v.patch;
};

export const AppHeader = () => {
  const params = useParams();
  const pathname = usePathname();
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { userData } = useUser();

  const currentOrg = userData?.currentOrganization?.name;
  const currentEnvSlug = params?.env || "localhost";

  const navItems = [
    {
      name: "Query",
      path: `/${currentOrg}/${currentEnvSlug}/query`,
      icon: <Database size={14} />,
      isDevOnly: false,
    },
    {
      name: "Stream",
      path: `/${currentOrg}/${currentEnvSlug}/stream`,
      icon: <Activity size={14} />,
      isDevOnly: false,
    },
    {
      name: "Dashboard",
      path: `/${currentOrg}/${currentEnvSlug}/dashboard`,
      icon: <BarChart3 size={14} />,
      isDevOnly: isProd,
    },
    {
      name: "Monitors",
      path: `/${currentOrg}/${currentEnvSlug}/monitors`,
      icon: <Bell size={14} />,
      isDevOnly: isProd,
    },
    {
      name: "Settings",
      path: `/${currentOrg}/${currentEnvSlug}/settings`,
      icon: <Settings size={14} />,
      isDevOnly: isProd,
    },
  ];

  // close the menu when the pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!userData) return;

  return (
    <div className={`flex justify-between px-10`}>
      <div className="flex items-center">
        <Link
          href={`/${currentOrg}/${currentEnvSlug}/overview`}
          className="mr-8"
        >
          {/* instead of logo */}
          <HexagonIcon size={18} />
        </Link>
        <ul className="flex gap-2">
          {navItems.map((item) => {
            return (
              <li key={item.path}>
                {item.isDevOnly ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={`group flex cursor-not-allowed items-center gap-1 px-2 py-1 text-sm font-medium opacity-60 transition-colors`}
                      >
                        {item.icon}
                        {item.name}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Coming soon!</TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    href={item.path}
                    className={`hover:text-foreground relative flex items-center gap-1 px-2 py-1 text-sm font-medium transition-colors ${
                      pathname.includes(item.path)
                        ? "text-foreground after:bg-primary after:absolute after:-bottom-2.5 after:left-0 after:h-0.5 after:w-full after:content-['']"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        {currentEnvSlug === "localhost" && (
          <Tooltip>
            <TooltipTrigger className="flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <HardDrive size={12} className="mr-1" />
              Local Storage Only
            </TooltipTrigger>
            <TooltipContent side="bottom">
              100% Local Data - Your logs are stored locally and will not be
              deleted
            </TooltipContent>
          </Tooltip>
        )}
        <div className="flex items-center gap-2">
          <div className="w-30">
            <EnvSwitcher userData={userData} />
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Avatar className="h-7 w-7">
                <AvatarImage src={gravatarURL(userData.user?.email)} />
                <AvatarFallback className="uppercase">
                  {userData.user?.firstName?.slice(0, 2) || (
                    <UserIcon size={14} />
                  )}
                </AvatarFallback>
              </Avatar>
            </SheetTrigger>
            <SheetContent>
              <SideMenu userData={userData} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

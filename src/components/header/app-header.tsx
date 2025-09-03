"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Database,
  Bell,
  BarChart3,
  HardDrive,
  Settings,
  HexagonIcon,
  UserIcon,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Users,
  Building,
  FileText,
  CreditCard,
  ChevronRight,
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
import { useAllEnvironments } from "@/context/list-environments";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ModeToggle from "../mode-toggle";

interface AppHeaderProps {
  userInfo: WhoamiResponse;
}

export const AppHeader = ({ userInfo }: AppHeaderProps) => {
  const { allowedUsage } = useAllEnvironments();

  const pathname = usePathname();
  const router = useRouter();
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const navItems = [
    {
      name: "Query",
      path: "/localhost/query",
      icon: <Database size={14} />,
      disabled: false,
    },
    {
      name: "Stream",
      path: "/localhost/stream",
      icon: <Activity size={14} />,
      disabled: false,
    },
    {
      name: "Dashboard",
      path: "/localhost/dashboard",
      icon: <BarChart3 size={14} />,
      disabled: isProd ? true : false,
    },
    {
      name: "Monitors",
      path: "/localhost/monitors",
      icon: <Bell size={14} />,
      disabled: isProd ? true : false,
    },
    {
      name: "Settings",
      path: "/localhost/settings",
      icon: <Settings size={14} />,
      disabled: isProd ? true : false,
    },
  ];

  // useEffect(() => {
  //   if (pathname === "/") router.push("/localhost/query");
  // }, []);

  return (
    <nav className="bg-muted flex w-full flex-col">
      <div className="sticky top-0 z-20">
        <div className={`flex justify-between px-10 py-1.5`}>
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <HexagonIcon size={18} />
            </Link>
            <ul className="flex gap-2">
              {navItems.map((item) => {
                return (
                  <li key={item.path}>
                    {item.disabled ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`group flex cursor-not-allowed items-center gap-1 px-2 py-1 text-sm font-medium opacity-60 transition-colors`}
                          >
                            {item.icon}
                            {item.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Coming soon!
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        href={item.path}
                        className={`hover:text-foreground relative flex items-center gap-1 px-2 py-1 text-sm font-medium transition-colors ${
                          pathname.includes(item.path)
                            ? "text-foreground after:bg-primary after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:content-['']"
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
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Avatar className="h-7 w-7">
                <AvatarImage src={gravatarURL(userInfo.user?.email)} />
                <AvatarFallback className="uppercase">
                  {userInfo.user?.firstName?.slice(0, 2) || (
                    <UserIcon size={14} />
                  )}
                </AvatarFallback>
              </Avatar>
            </SheetTrigger>
            <SheetContent>
              <SideMenu userInfo={userInfo} />
            </SheetContent>
          </Sheet>
          {/* <Tooltip>
            <TooltipTrigger className="flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <HardDrive size={12} className="mr-1" />
              Local Storage Only
            </TooltipTrigger>
            <TooltipContent side="bottom">
              100% Local Data - Your logs are stored locally and will not be
              deleted
            </TooltipContent>
          </Tooltip> */}
        </div>
      </div>
    </nav>
  );
};

interface SideMenuProps {
  userInfo: WhoamiResponse;
}

const SideMenu = ({ userInfo }: SideMenuProps) => {
  const router = useRouter();
  const { doLogout } = useAllEnvironments();

  const handleLogout = () => {
    doLogout();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col">
      {/* User Info Section */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={gravatarURL(userInfo.user?.email)} />
          <AvatarFallback className="uppercase">
            {userInfo.user?.firstName?.slice(0, 2) || <UserIcon size={20} />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="text-sm font-semibold">
            {userInfo.user?.firstName && userInfo.user?.lastName
              ? `${userInfo.user.firstName} ${userInfo.user.lastName}`
              : userInfo.user?.username || "User"}
          </div>
          <div className="text-muted-foreground text-xs">
            {userInfo.user?.email}
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Settings Section */}
      <div className="px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          Settings
        </div>
        <div className="space-y-1">
          <Link
            href="/settings/users"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <Users size={16} className="mr-3" />
            <span className="text-sm">User</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
          <Link
            href="/settings/localhost"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <HardDrive size={16} className="mr-3" />
            <span className="text-sm">Localhost</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
          <Link
            href="/settings/org"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <Building size={16} className="mr-3" />
            <span className="text-sm">Organization</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Navigation Section */}
      <div className="px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          Navigation
        </div>
        <div className="space-y-1">
          <Link
            href="/docs"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <FileText size={16} className="mr-3" />
            <span className="text-sm">Docs</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
          <Link
            href="/pricing"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <CreditCard size={16} className="mr-3" />
            <span className="text-sm">Pricing</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Logout Section - Bottom */}
      <div className="mt-auto p-4">
        <Separator className="mb-4" />
        <div className="flex justify-between">
          <Button
            variant="ghost"
            className="h-auto justify-start px-2 py-2"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            <span className="text-sm">Log out</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

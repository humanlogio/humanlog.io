"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Database,
  Bell,
  BarChart3,
  HardDrive,
  Network,
} from "lucide-react";
import config from "@/features/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocalhostLayoutProps {
  children: ReactNode;
}

const LocalhostLayout = ({ children }: LocalhostLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  // const isProd = true;

  const navItems = [
    {
      name: "Query",
      path: "/localhost/query",
      icon: <Database size={16} />,
      disabled: false,
    },
    {
      name: "Stream",
      path: "/localhost/stream",
      icon: <Activity size={16} />,
      disabled: false,
    },
    {
      name: "Dashboard",
      path: "/localhost/dashboard",
      icon: <BarChart3 size={16} />,
      disabled: isProd ? true : false,
    },
    {
      name: "Alerts",
      path: "/localhost/alerts",
      icon: <Bell size={16} />,
      disabled: isProd ? true : false,
    },
  ];

  useEffect(() => {
    if (
      isProd &&
      pathname !== "/localhost/query" &&
      !pathname.startsWith("/localhost/traces") &&
      !pathname.startsWith("/localhost/stream") &&
      pathname.startsWith("/localhost/")
    ) {
      router.push("/localhost/query");
    }
  }, [isProd, pathname, router]);

  return (
    <div className="flex w-full flex-col">
      <div className={`sticky top-14 z-20`}>
        <nav className="bg-background border-b">
          <div className={`flex justify-between px-10 py-2`}>
            <ul className="flex gap-4">
              {navItems.map((item) => {
                return (
                  <li key={item.path}>
                    {item.disabled ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`hover:bg-muted group flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium opacity-60 transition-colors`}
                            >
                              {item.icon}
                              {item.name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Coming soon!
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Link
                        href={item.path}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.includes(item.path)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
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
            <TooltipProvider>
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
            </TooltipProvider>
          </div>
        </nav>
      </div>
      <main className={`flex-1`}>{children}</main>
    </div>
  );
};

export default LocalhostLayout;

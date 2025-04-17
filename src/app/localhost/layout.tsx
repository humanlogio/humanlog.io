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
  Info,
  X,
} from "lucide-react";
import config from "@/features/config";
import { useFullWidth } from "@/context/full-width-provider";

interface LocalhostLayoutProps {
  children: ReactNode;
}

const LocalhostLayout = ({ children }: LocalhostLayoutProps) => {
  const { isFullWidth } = useFullWidth();
  const pathname = usePathname();
  const router = useRouter();
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  // const isProd = true;

  const [showBanner, setShowBanner] = useState(true);

  const navItems = [
    {
      name: "Query",
      path: "/localhost/query",
      icon: <Database size={16} />,
    },
    {
      name: "Stream",
      path: "/localhost/stream",
      icon: <Activity size={16} />,
    },
    {
      name: "Dashboard",
      path: "/localhost/dashboard",
      icon: <BarChart3 size={16} />,
    },
    {
      name: "Monitors",
      path: "/localhost/monitors",
      icon: <Bell size={16} />,
    },
  ];

  useEffect(() => {
    if (
      isProd &&
      pathname !== "/localhost/query" &&
      pathname.startsWith("/localhost/")
    ) {
      router.push("/localhost/query");
    }
  }, [isProd, pathname, router]);

  return (
    <div className="flex w-full flex-col">
      <div className={`sticky z-50 ${!isProd ? "top-0" : "top-14"}`}>
        {showBanner && (
          <div className="flex w-full bg-emerald-50 px-4 dark:border-b dark:border-emerald-800/40 dark:bg-black">
            <div
              className={`flex w-full px-4 py-2 ${!isFullWidth && "container"}`}
            >
              <div className={`mx-auto w-full`}>
                <div className="flex flex-col justify-between md:flex-row md:items-center">
                  <div className="flex items-center text-sm">
                    <HardDrive
                      size={16}
                      className="mr-2 text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      Localhost Mode
                    </span>
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                      100% Local Data - Your logs are stored locally and will
                      not be deleted
                    </span>
                  </div>
                  {!isProd && (
                    <Link
                      href={`/pricing`}
                      className="flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    >
                      <Info size={12} className="mr-1" />
                      Local Storage Only
                    </Link>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowBanner(false)}
                className="ml-3 rounded-full p-1 text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-800/60"
                aria-label="Close banner"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {!isProd && (
          <nav className="bg-background border-b">
            <div
              className={`px-10 py-2 md:flex md:justify-between ${!isFullWidth && "container"}`}
            >
              <ul className="flex gap-4">
                {navItems.map((item) => {
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        )}
      </div>
      <main className={`flex-1`}>{children}</main>
    </div>
  );
};

export default LocalhostLayout;

"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Database, Bell, BarChart3 } from "lucide-react";
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
    <div className="flex w-full flex-col px-10">
      {!isProd && (
        <nav className="bg-background border-b">
          <div className={`py-2 ${!isFullWidth && "container"}`}>
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

      <main className={`flex-1 ${!isFullWidth && "container"}`}>
        {children}
      </main>
    </div>
  );
};

export default LocalhostLayout;

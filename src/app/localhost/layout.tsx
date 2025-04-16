"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Database, Bell, BarChart3 } from "lucide-react";
import config from "@/features/config";

interface LocalhostLayoutProps {
  children: ReactNode;
}

const LocalhostLayout = ({ children }: LocalhostLayoutProps) => {
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
    <div className="flex w-full flex-col">
      {!isProd && (
        <nav className="bg-background border-b">
          <div className="container py-2">
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

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default LocalhostLayout;

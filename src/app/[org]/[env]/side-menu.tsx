import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import config from "@/features/config";
import {
  Activity,
  Database,
  Settings,
  PanelRightClose,
  PanelLeftClose,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { usePageStore } from "@/stores/page-store";
import { Separator } from "@/components/ui/separator";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SideMenuProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export const SideMenu = ({ isExpanded, setIsExpanded }: SideMenuProps) => {
  // TODO: 함수 util로 분리하기
  const localhostVersion = (res: PingResponse) => {
    const v = res.clientVersion!;
    return "v" + v.major + "." + v.minor + "." + v.patch;
  };
  const params = useParams();
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  const { userData } = useUser();
  const { activePage } = usePageStore();
  const currentOrg = userData?.currentOrganization?.name;
  const currentEnvSlug = params?.env || "localhost";
  // PostHog feature flags
  const showProjectMenu = useFeatureFlag("release_project_menu_temp", true);

  const navItems = [
    {
      name: "Query",
      page: "query",
      path: `/${currentOrg}/${currentEnvSlug}/query`,
      icon: <Database size={14} />,
      isReady: true,
    },
    {
      name: "Stream",
      page: "stream",
      path: `/${currentOrg}/${currentEnvSlug}/stream`,
      icon: <Activity size={14} />,
      isReady: true,
    },
    {
      name: "Project",
      page: "project",
      path: `/${currentOrg}/${currentEnvSlug}/project`,
      icon: <FolderKanban size={14} />,
      isReady: showProjectMenu,
    },
    {
      name: "Settings",
      page: "settings",
      path: `/${currentOrg}/${currentEnvSlug}/settings`,
      icon: <Settings size={14} />,
      isReady: true,
    },
  ];

  return (
    <div
      className={`fixed top-12 left-0 z-10 flex h-[calc(100vh-3rem)] flex-col justify-between overflow-x-hidden border-r bg-neutral-50 transition-all duration-300 ease-in-out dark:bg-neutral-950 ${
        isExpanded ? "w-35" : "w-13 md:w-35"
      }`}
    >
      <nav className="space-y-1 p-2">
        {navItems.map((item) =>
          item.isReady ? (
            <div key={item.path}>
              {item.page === "settings" && <Separator className="my-1" />}
              <Link href={item.path}>
                <Button
                  variant="ghost"
                  className={`h-9 w-full justify-start px-2 ${activePage === item.page && "bg-accent text-accent-foreground"}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              </Link>
            </div>
          ) : (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="ghost"
                    className={`h-9 w-full justify-start px-2 ${activePage === item.page && "bg-accent text-accent-foreground"}`}
                    disabled
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Coming soon!</TooltipContent>
            </Tooltip>
          ),
        )}
      </nav>

      <div className="w-full justify-start md:hidden">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:bg-transparent"
        >
          {isExpanded ? (
            <PanelLeftClose size={14} />
          ) : (
            <PanelRightClose size={14} />
          )}
        </Button>
      </div>
    </div>
  );
};

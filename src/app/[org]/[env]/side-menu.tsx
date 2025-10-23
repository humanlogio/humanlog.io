import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import config from "@/features/config";
import {
  Activity,
  Database,
  Bell,
  BarChart3,
  HardDrive,
  Settings,
  HexagonIcon,
  UserIcon,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { usePage } from "@/stores/page-store";
import { Separator } from "@/components/ui/separator";

export const SideMenu = () => {
  // TODO: 함수 util로 분리하기
  const localhostVersion = (res: PingResponse) => {
    const v = res.clientVersion!;
    return "v" + v.major + "." + v.minor + "." + v.patch;
  };
  const params = useParams();
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  const { userData } = useUser();
  const { activePage } = usePage();
  const currentOrg = userData?.currentOrganization?.name;
  const currentEnvSlug = params?.env || "localhost";

  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    {
      name: "Query",
      page: "query",
      path: `/${currentOrg}/${currentEnvSlug}/query`,
      icon: <Database size={14} />,
      isDevOnly: false,
    },
    {
      name: "Stream",
      page: "stream",
      path: `/${currentOrg}/${currentEnvSlug}/stream`,
      icon: <Activity size={14} />,
      isDevOnly: false,
    },
    {
      name: "Project",
      page: "project",
      path: `/${currentOrg}/${currentEnvSlug}/project`,
      icon: <FolderKanban size={14} />,
      isDevOnly: isProd,
    },
    {
      name: "Settings",
      page: "settings",
      path: `/${currentOrg}/${currentEnvSlug}/settings`,
      icon: <Settings size={14} />,
      isDevOnly: isProd,
    },
  ];

  return (
    <div
      className={`h-full border-r bg-neutral-50 transition-all duration-300 ease-in-out dark:bg-neutral-950 ${isExpanded ? "w-35" : "w-13"} flex flex-col justify-between overflow-x-hidden`}
    >
      {/* 메뉴 아이템들 */}
      <nav className="space-y-1 p-2">
        {navItems.map((item) => (
          <div key={item.path}>
            {item.page === "settings" && <Separator />}
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
        ))}
      </nav>

      {/* 토글 버튼 */}
      <div className="w-full justify-start">
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

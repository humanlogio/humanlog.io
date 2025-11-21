import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localhostVersion } from "@/components/header/app-header";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironmentStore } from "@/stores/environment-store";
import { buildOrgEnvUrl } from "@/lib/utils/navigation";
import { usePageStore } from "@/stores/page-store";
import { useQuery } from "@connectrpc/connect-query";
import { CursorSchema } from "api/js/types/v1/cursor_pb";
import { listEnvironment } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { create } from "@bufbuild/protobuf";
import { usePing } from "@/hooks/usePing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HardDrive } from "lucide-react";
import { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
interface Source {
  name: string;
  path: string;
  value: string;
}

interface EnvSwitcherProps {
  user: User | undefined;
}

export const EnvSwitcher = ({ user }: EnvSwitcherProps) => {
  const router = useRouter();
  const params = useParams();
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();
  const { activePage } = usePageStore();
  const { localhostData } = usePing();
  const { setActiveEnvironment, activeEnvironment } = useEnvironmentStore();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const { data: listEnvironmentData } = useQuery(listEnvironment, {
    cursor: create(CursorSchema),
    limit: 100,
  });
  const { data: organizations } = authClient.useListOrganizations();

  const currentEnvSlug = params?.env as string;

  const getCurrentSelectedValue = () => {
    if (currentEnvSlug === "localhost" || !activeEnvironment) {
      if (!localhostData) return;
      return localhostVersion(localhostData);
    }

    if (!listEnvironmentData) return;

    const currentEnv = listEnvironmentData.items.find(
      (env) =>
        env.environment?.id === activeEnvironment?.environment?.id ||
        env.environment?.name === currentEnvSlug,
    );

    return currentEnv?.environment?.id?.toString() || "";
  };

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);

    if (!selected || !listEnvironmentData) return;

    const activeEnv = listEnvironmentData.items.find(
      (env) => env.environment?.id.toString() === selected.value,
    );
    setActiveEnvironment(activeEnv ?? undefined);
    router.push(selected.path);
  };

  useEffect(() => {
    const _menuList: Source[] = [];

    if (localhostData) {
      _menuList.push({
        name: `localhost ${localhostVersion(localhostData)}`,
        path: `/${activeOrganization?.slug}/localhost/${activePage}`,
        value: localhostVersion(localhostData),
      });
    }

    if (!listEnvironmentData) return;

    listEnvironmentData.items.forEach((env) => {
      _menuList.push({
        name: env.environment?.name || "",
        path: buildOrgEnvUrl(
          activeOrganization?.slug || "",
          env.environment?.name || "",
          activePage,
        ),
        value: env.environment?.id?.toString() || "",
      });
    });
    _menuList.push({
      name: "+ Add new",
      path: `/${activeOrganization?.slug}/env/new`,
      value: "add-new",
    });

    setMenuList(_menuList);
  }, [listEnvironmentData, activeOrganization, localhostData, activePage]);

  return (
    <div className="flex items-center gap-3">
      <Select value={getCurrentSelectedValue()} onValueChange={updateSelection}>
        <SelectTrigger className="h-8 w-full min-w-42">
          <div className="line-clamp-1 flex flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap">
            <SelectValue placeholder="Select source" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {menuList.map((menu, i) => (
              <SelectItem className="cursor-pointer" key={i} value={menu.value}>
                {menu.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {currentEnvSlug === "localhost" && (
        <Tooltip>
          <TooltipTrigger className="flex h-8 items-center gap-1 rounded-lg border border-[#19D163] bg-[#82E2A9]/10 px-3 py-1 whitespace-nowrap">
            <HardDrive size={16} className="mr-1 text-[#19D163]" />
            <span className="text-green-600">Local Storage Only</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            100% Local Data - Your logs are stored locally
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

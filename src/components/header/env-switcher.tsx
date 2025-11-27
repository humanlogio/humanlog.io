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
import {
  ActiveEnvironment,
  useEnvironmentStore,
} from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
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
import { authClient } from "@/lib/auth-client";
interface Source {
  name: string;
  path: string;
  value: string;
}

export const EnvSwitcher = () => {
  const router = useRouter();
  const params = useParams();
  const currentEnvSlug = params?.env as string;

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

  const getCurrentSelectedValue = () => {
    if (!activeEnvironment) return undefined;
    if (activeEnvironment.type === "localhost") {
      return localhostVersion(activeEnvironment.data);
    }

    return activeEnvironment.data.environment?.id?.toString();
  };

  const updateSelection = (value: string) => {
    let activeEnv: ActiveEnvironment;
    const selected = menuList.find((menu) => menu.value === value);

    if (!selected) {
      setActiveEnvironment(undefined);
      return;
    }

    if (localhostData && value === localhostVersion(localhostData)) {
      activeEnv = { type: "localhost", data: localhostData };
    }

    if (listEnvironmentData) {
      const _activeEnv = listEnvironmentData.items.find(
        (env) => env.environment?.id.toString() === selected.value,
      );
      if (_activeEnv) {
        activeEnv = { type: "hosted", data: _activeEnv };
      }

      setActiveEnvironment(activeEnv);
      router.push(selected.path);
    }
  };

  useEffect(() => {
    if (!activeEnvironment) return;

    const isLocalhost =
      activeEnvironment.type === "localhost" && currentEnvSlug === "localhost";
    const isHosted =
      activeEnvironment.type === "hosted" &&
      currentEnvSlug === activeEnvironment.data.environment?.name;

    if (isLocalhost || isHosted) return;
    setActiveEnvironment(undefined);
  }, [currentEnvSlug]);

  useEffect(() => {
    const _menuList: Source[] = [];

    if (localhostData) {
      _menuList.push({
        name: `localhost ${localhostVersion(localhostData)}`,
        path: getOrgEnvUrl(
          activeOrganization,
          { type: "localhost", data: localhostData },
          activePage,
        ),
        value: localhostVersion(localhostData),
      });
    }

    if (!listEnvironmentData) return;

    listEnvironmentData.items.forEach((env) => {
      _menuList.push({
        name: env.environment?.name || "",
        path: getOrgEnvUrl(
          activeOrganization,
          {
            type: "hosted",
            data: env,
          },
          activePage,
        ),
        value: env.environment?.id?.toString() || "",
      });
    });
    _menuList.push({
      name: "+ Add new",
      path: activeOrganization
        ? `/${activeOrganization?.slug}/env/new`
        : "/settings/org",
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

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
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { useEnvironmentStore } from "@/stores/environment-store";
import { buildOrgEnvUrl } from "@/lib/utils/navigation";
import { usePage } from "@/stores/page-store";
import { useQuery } from "@connectrpc/connect-query";
import { CursorSchema } from "api/js/types/v1/cursor_pb";
import { listEnvironment } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { create } from "@bufbuild/protobuf";
import { usePing } from "@/hooks/usePing";
interface Source {
  name: string;
  path: string;
  value: string;
}

interface EnvSwitcherProps {
  userData: WhoamiResponse;
}

export const EnvSwitcher = ({ userData }: EnvSwitcherProps) => {
  const router = useRouter();
  const params = useParams();
  const { activePage } = usePage();
  const { localhostData } = usePing();
  const { setActiveEnvironment, activeEnvironment } = useEnvironmentStore();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const { data: listEnvironmentData } = useQuery(listEnvironment, {
    cursor: create(CursorSchema),
    limit: 100,
  });

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
        path: buildOrgEnvUrl(
          userData?.currentOrganization?.name || "",
          "localhost",
          activePage,
        ),
        value: localhostVersion(localhostData),
      });
    }

    if (!listEnvironmentData) return;

    listEnvironmentData.items.forEach((env) => {
      _menuList.push({
        name: env.environment?.name || "",
        path: buildOrgEnvUrl(
          userData?.currentOrganization?.name || "",
          env.environment?.name || "",
          activePage,
        ),
        value: env.environment?.id?.toString() || "",
      });
    });
    _menuList.push({
      name: "+ Add new",
      path: `/${userData?.currentOrganization?.name}/env/new`,
      value: "add-new",
    });

    setMenuList(_menuList);
  }, [listEnvironmentData, userData, localhostData, activePage]);

  return (
    <Select value={getCurrentSelectedValue()} onValueChange={updateSelection}>
      <SelectTrigger className="h-7 w-full">
        <div className="line-clamp-1 flex flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap">
          <SelectValue placeholder="Select env" className="text-xs" />
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
  );
};

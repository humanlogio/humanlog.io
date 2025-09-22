import { useAllEnvironments } from "@/context/list-environments";
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

interface Source {
  name: string;
  path: string;
  value: string;
}

interface EnvSwitcherProps {
  userInfo: WhoamiResponse;
}

export const EnvSwitcher = ({ userInfo }: EnvSwitcherProps) => {
  const router = useRouter();
  const params = useParams();
  const { activePage } = usePage();

  const { setActiveEnvironment, activeEnvironment } = useEnvironmentStore();
  const { localhostInfo, listEnvironments } = useAllEnvironments();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const currentEnvSlug = params?.env as string;

  const getCurrentSelectedValue = () => {
    if (!localhostInfo) return;

    if (currentEnvSlug === "localhost" || !activeEnvironment) {
      return localhostVersion(localhostInfo);
    }

    const currentEnv = listEnvironments.find(
      (env) =>
        env.environment?.id === activeEnvironment?.environment?.id ||
        env.environment?.name === currentEnvSlug,
    );

    return currentEnv?.environment?.id?.toString() || "";
  };

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    const activeEnv = listEnvironments.find(
      (env) => env.environment?.id.toString() === selected.value,
    );
    setActiveEnvironment(activeEnv ?? undefined);
    router.push(selected.path);
  };

  useEffect(() => {
    const _menuList: Source[] = [];

    if (localhostInfo) {
      _menuList.push({
        name: `localhost ${localhostVersion(localhostInfo)}`,
        path: buildOrgEnvUrl(
          userInfo?.currentOrganization?.name || "",
          "localhost",
          activePage,
        ),
        value: localhostVersion(localhostInfo),
      });
    }

    listEnvironments.forEach((env) => {
      _menuList.push({
        name: env.environment?.name || "",
        path: buildOrgEnvUrl(
          userInfo?.currentOrganization?.name || "",
          env.environment?.name || "",
          activePage,
        ),
        value: env.environment?.id?.toString() || "",
      });
    });
    _menuList.push({
      name: "+ Add new",
      path: `/${userInfo?.currentOrganization?.name}/env/new`,
      value: "add-new",
    });

    setMenuList(_menuList);
  }, [listEnvironments, userInfo, localhostInfo, activePage]);

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

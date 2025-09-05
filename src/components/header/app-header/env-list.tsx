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
import { useApiClients } from "@/context/api-provider";

interface Source {
  name: string;
  path: string;
  value: string;
}

interface EnvListProps {
  userInfo: WhoamiResponse;
}

export const EnvList = ({ userInfo }: EnvListProps) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { activeEnvironment, setActiveEnvironment } = useApiClients();
  const { localhostInfo, listEnvironments } = useAllEnvironments();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const currentEnvSlug = params?.env as string;

  const getCurrentSelectedValue = () => {
    if (
      (currentEnvSlug === "localhost" || !activeEnvironment) &&
      localhostInfo
    ) {
      return localhostVersion(localhostInfo);
    }

    const currentEnv = listEnvironments.find(
      (env) =>
        env.environment?.id === activeEnvironment?.id ||
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

    setActiveEnvironment(activeEnv?.environment);

    router.push(selected.path);
  };

  useEffect(() => {
    const _menuList: Source[] = [];

    if (localhostInfo) {
      _menuList.push({
        name: `localhost ${localhostVersion(localhostInfo)}`,
        path: `/${userInfo?.currentOrganization?.name}/localhost/query`,
        value: localhostVersion(localhostInfo),
      });
    }

    listEnvironments.forEach((env) => {
      _menuList.push({
        name: env.environment?.name || "",
        path: `/${userInfo?.currentOrganization?.name}/${env.environment?.name}/query`,
        value: env.environment?.id?.toString() || "",
      });
    });
    _menuList.push({
      name: "+ Add new",
      path: `/${userInfo?.currentOrganization?.name}/env/new`,
      value: "add-new",
    });

    setMenuList(_menuList);
  }, [listEnvironments, localhostInfo, userInfo, pathname]);

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

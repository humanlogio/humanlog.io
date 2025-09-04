import { useAllEnvironments } from "@/context/list-environments";
import { useParams, useRouter } from "next/navigation";
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

interface Source {
  name: string;
  path: string;
  value: string;
  isLocalhost: boolean;
}

interface EnvListProps {
  userInfo: WhoamiResponse;
}

export const EnvList = ({ userInfo }: EnvListProps) => {
  const router = useRouter();
  const params = useParams();
  const { localhostInfo, listEnvironments } = useAllEnvironments();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const currentEnvSlug = params?.env as string;

  const getCurrentSelectedValue = () => {
    if (currentEnvSlug === "localhost" && localhostInfo) {
      return localhostVersion(localhostInfo);
    }

    const currentEnv = listEnvironments.find(
      (env) => env.environment?.name === currentEnvSlug,
    );

    return currentEnv?.environment?.id?.toString() || "";
  };

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    router.push(selected.path);
  };

  useEffect(() => {
    const _menuList: Source[] = [];

    if (localhostInfo) {
      _menuList.push({
        name: `localhost ${localhostVersion(localhostInfo)}`,
        path: `/${userInfo?.currentOrganization?.name}/localhost/query`,
        value: localhostVersion(localhostInfo),
        isLocalhost: true,
      });
    }

    listEnvironments.forEach((env) => {
      _menuList.push({
        name: env.environment?.name || "",
        path: `/${userInfo?.currentOrganization?.name}/${env.environment?.name}/query`,
        value: env.environment?.id?.toString() || "",
        isLocalhost: false,
      });
    });

    setMenuList(_menuList);
  }, [listEnvironments, localhostInfo, userInfo]);

  return (
    <Select value={getCurrentSelectedValue()} onValueChange={updateSelection}>
      <SelectTrigger className="h-7 w-full">
        <div className="flex flex-row items-center">
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

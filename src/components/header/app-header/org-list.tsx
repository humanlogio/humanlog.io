import { useAllEnvironments } from "@/context/list-environments";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
}

interface OrgListProps {
  userInfo: WhoamiResponse;
}

export const OrgList = ({ userInfo }: OrgListProps) => {
  const router = useRouter();
  const params = useParams();
  const { listOrganizations } = useAllEnvironments();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const currentOrgSlug = params?.org as string;
  const currentEnvSlug = params?.env as string;

  const getCurrentSelectedValue = () => {
    const currentOrg = listOrganizations.find(
      (org) => org.organization?.name === currentOrgSlug,
    );

    return currentOrg?.organization?.id.toString() || "";
  };

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    router.push(selected.path);
  };

  useEffect(() => {
    const _menuList: Source[] = [];

    listOrganizations.forEach((org) => {
      _menuList.push({
        name: org.organization?.name || "",
        path: `/${org.organization?.name}/${currentEnvSlug}/query`,
        value: org.organization?.id?.toString() || "",
      });
    });

    setMenuList(_menuList);
  }, [listOrganizations, userInfo]);

  return (
    <Select value={getCurrentSelectedValue()} onValueChange={updateSelection}>
      <SelectTrigger className="h-7 w-full">
        <div className="flex flex-row items-center">
          <SelectValue placeholder="Select org" className="text-xs" />
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

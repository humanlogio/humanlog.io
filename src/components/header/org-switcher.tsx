import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePageStore } from "@/stores/page-store";
import { User } from "better-auth";
import { authClient } from "@/lib/auth-client";

interface Source {
  name: string;
  path: string;
  value: string;
}

interface OrgSwitcherProps {
  user: User;
}

export const OrgSwitcher = ({ user }: OrgSwitcherProps) => {
  const pathname = usePathname();
  const { activePage } = usePageStore();
  const { activeEnvironment } = useEnvironmentStore();
  const { useListOrganizations, organization, useActiveOrganization } =
    authClient;
  const { data: listOrganizations } = useListOrganizations();
  const { data: activeOrganization } = useActiveOrganization();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    organization.setActive({
      organizationId: value,
    });
  };

  useEffect(() => {
    const _menuList: Source[] = [];
    listOrganizations?.forEach((org) => {
      _menuList.push({
        name: org.name || "",
        path: getOrgEnvUrl(org, activeEnvironment, activePage),
        value: org.id.toString(),
      });
    });

    setMenuList(_menuList);
  }, [listOrganizations, user, activeEnvironment, pathname]);

  return (
    <Select
      value={activeOrganization?.id || ""}
      onValueChange={updateSelection}
    >
      <SelectTrigger className="w-full">
        <div className="line-clamp-1 flex flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap">
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

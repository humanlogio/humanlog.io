import { usePathname } from "next/navigation";
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
import { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { Organization } from "better-auth/plugins";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationStore } from "@/stores/organization-store";

interface Source {
  name: string;
  value: string;
}

interface OrgSwitcherProps {
  user: User;
}

export const OrgSwitcher = ({ user }: OrgSwitcherProps) => {
  const pathname = usePathname();
  const { activeEnvironment } = useEnvironmentStore();
  const { useListOrganizations, organization, useActiveOrganization } =
    authClient;
  const { data: listOrganizations, isPending: isListOrganizationsPending } =
    useListOrganizations();
  const { data: activeOrganization, isPending: isActiveOrganizationPending } =
    useActiveOrganization();

  const { setLastActiveOrgId } = useOrganizationStore();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    organization.setActive({
      organizationId: value,
    });

    setLastActiveOrgId(value);
  };

  useEffect(() => {
    const _menuList: Source[] = [];
    listOrganizations?.forEach((org: Organization) => {
      _menuList.push({
        name: org.name || "",
        value: org.id.toString(),
      });
    });

    setMenuList(_menuList);
  }, [listOrganizations, user, activeEnvironment, pathname]);

  return isActiveOrganizationPending || isListOrganizationsPending ? (
    <Skeleton className="h-8 w-full animate-pulse" />
  ) : (
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

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
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { getAuthURL } from "api/js/svc/auth/v1/service-AuthService_connectquery";
import { toast } from "sonner";
import { getSelfURL } from "@/lib/config/envs";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePageStore } from "@/stores/page-store";
import { listOrganization } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import { CursorSchema } from "api/js/types/v1/cursor_pb";
import { create } from "@bufbuild/protobuf";
import { User } from "better-auth";
import { useOrganizationStore } from "@/stores/user-store";

interface Source {
  name: string;
  path: string;
  value: string;
}

interface OrgSwitcherProps {
  user: User;
}

export const OrgSwitcher = ({ user }: OrgSwitcherProps) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { activePage } = usePageStore();
  const { activeEnvironment } = useEnvironmentStore();

  const { currentOrganization } = useOrganizationStore();

  const [menuList, setMenuList] = useState<Source[]>([]);

  const { data: listOrganizations } = useQuery(listOrganization, {
    cursor: create(CursorSchema),
    limit: 100,
  });

  const { mutate: getAuthURLMutation } = useMutation(getAuthURL, {
    onSuccess: (res) => {
      router.push(res.authUrl);
    },
    onError: (err) => {
      toast.error(err.message);
      router.push("/");
    },
  });

  const getCurrentSelectedValue = () => {
    return currentOrganization?.id.toString() || "";
  };

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    getAuthURLMutation({
      username: user?.name,
      organization: {
        case: "byId",
        value: BigInt(value),
      },
      returnToUrl: `${getSelfURL()}/login`,
    });
  };

  useEffect(() => {
    const _menuList: Source[] = [];
    listOrganizations?.items.forEach((org) => {
      _menuList.push({
        name: org.organization?.name || "",
        path: getOrgEnvUrl(currentOrganization, activeEnvironment, activePage),
        value: org.organization?.id?.toString() || "",
      });
    });
    setMenuList(_menuList);
  }, [listOrganizations, user, activeEnvironment, pathname]);

  return (
    <Select value={getCurrentSelectedValue()} onValueChange={updateSelection}>
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

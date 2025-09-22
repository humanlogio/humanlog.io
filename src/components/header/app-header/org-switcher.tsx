import { useAllEnvironments } from "@/context/list-environments";
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
import { useMutation } from "@connectrpc/connect-query";
import { getAuthURL } from "api/js/svc/auth/v1/service-AuthService_connectquery";
import { toast } from "sonner";
import { getSelfURL } from "@/lib/envs";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePage } from "@/stores/page-store";

interface Source {
  name: string;
  path: string;
  value: string;
}

interface OrgSwitcherProps {
  userInfo: WhoamiResponse;
}

export const OrgSwitcher = ({ userInfo }: OrgSwitcherProps) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { activeEnvironment } = useEnvironmentStore();
  const { listOrganizations } = useAllEnvironments();
  const { activePage } = usePage();

  const [menuList, setMenuList] = useState<Source[]>([]);

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
    return userInfo.currentOrganization?.id.toString() || "";
  };

  const updateSelection = (value: string) => {
    const selected = menuList.find((menu) => menu.value === value);
    if (!selected) return;

    getAuthURLMutation({
      username: userInfo.user?.username,
      organization: {
        case: "byId",
        value: BigInt(value),
      },
      returnToUrl: `${getSelfURL()}/login`,
    });
  };

  useEffect(() => {
    const _menuList: Source[] = [];

    listOrganizations.forEach((org) => {
      _menuList.push({
        name: org.organization?.name || "",
        path: getOrgEnvUrl(userInfo, activeEnvironment, activePage),
        value: org.organization?.id?.toString() || "",
      });
    });

    setMenuList(_menuList);
  }, [listOrganizations, userInfo, activeEnvironment, pathname]);

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

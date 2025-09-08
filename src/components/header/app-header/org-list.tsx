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
import { useApiClients } from "@/context/api-provider";

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
  const { activeEnvironment } = useApiClients();
  const { listOrganizations } = useAllEnvironments();

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
    const currentOrg = listOrganizations.find(
      (org) => org.organization?.name === userInfo.currentOrganization?.name,
    );
    return currentOrg?.organization?.id.toString() || "";
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
        path: `/${org.organization?.name}/${activeEnvironment?.name}/query`,
        value: org.organization?.id?.toString() || "",
      });
    });

    setMenuList(_menuList);
  }, [listOrganizations, userInfo]);

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

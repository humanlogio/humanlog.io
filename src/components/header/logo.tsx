import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useEnvironmentStore } from "@/stores/environment-store";
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";

interface LogoProps {
  userData: WhoamiResponse | undefined;
}

export const Logo = ({ userData }: LogoProps) => {
  const { activeEnvironment } = useEnvironmentStore();

  return (
    <NavigationMenuItem className="px-1 text-sm">
      <NavigationMenuLink
        href={
          userData ? getOrgEnvUrl(userData, activeEnvironment, "query") : "/"
        }
      >
        Humanlog
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

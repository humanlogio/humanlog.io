import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useOrganizationStore } from "@/stores/user-store";
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { User } from "better-auth";

interface LogoProps {
  user: User | undefined;
  // userData: WhoamiResponse | undefined;
}

export const Logo = ({ user }: LogoProps) => {
  const { activeEnvironment } = useEnvironmentStore();
  const { currentOrganization } = useOrganizationStore();
  const url = `/${currentOrganization?.name}/${activeEnvironment?.environment?.name ?? "localhost"}/query`;

  return (
    <NavigationMenuItem className="px-1 text-sm">
      <NavigationMenuLink href={user ? url : "/"}>Humanlog</NavigationMenuLink>
    </NavigationMenuItem>
  );
};

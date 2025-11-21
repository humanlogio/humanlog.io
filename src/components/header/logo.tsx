import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import { useEnvironmentStore } from "@/stores/environment-store";
import { User } from "better-auth";

interface LogoProps {
  user: User | undefined;
}

export const Logo = ({ user }: LogoProps) => {
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();
  const { activeEnvironment } = useEnvironmentStore();
  const url = `/${activeOrganization?.slug}/${activeEnvironment?.environment?.name ?? "localhost"}/query`;

  return (
    <NavigationMenuItem className="px-1 text-sm">
      <NavigationMenuLink href={user ? url : "/"}>Humanlog</NavigationMenuLink>
    </NavigationMenuItem>
  );
};

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { gravatarURL } from "@/lib/utils/avatar";
import { Building, ChevronRight, LogOut, User, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OrgSwitcher } from "@/components/header/org-switcher";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { User as BetterAuthUser } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { useEnvironmentStore } from "@/stores/environment-store";
import { usePageStore } from "@/stores/page-store";
import { toast } from "sonner";

interface UserActionsProps {
  user: BetterAuthUser | undefined;
}

export const UserActions = ({ user }: UserActionsProps) => {
  const router = useRouter();
  const { signOut } = authClient;
  const { setActiveEnvironment } = useEnvironmentStore();
  const { clearPage } = usePageStore();

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setActiveEnvironment(undefined);
          clearPage();
          router.push("/");
        },
        onError: (error) => {
          toast.error(`Failed to log out: ${error.error.message}`);
          console.error(error);
        },
      },
    });
  };

  // humanlog.io is taking a break, so there's nothing to sign in to and the
  // "Sign In" button is gone. Signed-out visitors keep the theme toggle, which
  // otherwise only exists inside the signed-in menu below.
  // See https://www.webscale.lol/blog/humanlog-retro
  return !user ? (
    <NavigationMenuItem>
      <ThemeToggle />
    </NavigationMenuItem>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-md p-1 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={gravatarURL(user?.email)} />
            <AvatarFallback className="uppercase">
              {user.name || <UserIcon size={16} />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]" sideOffset={12}>
        <div className="px-2 py-1.5">
          <SectionTitle>Current Organization</SectionTitle>
          <div className="mt-1">
            <OrgSwitcher user={user} />
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1">
          <SectionTitle>Settings</SectionTitle>
          <DropdownMenuItem asChild>
            <Link
              href="/settings/org"
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Building size={16} />
                Organization
              </div>
              <ChevronRight size={12} />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings/users"
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                User
              </div>
              <ChevronRight size={12} />
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs">Theme</div>
            <ThemeToggle />
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <button onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} />
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface SectionTitleProps {
  children: ReactNode;
}

const SectionTitle = ({ children }: SectionTitleProps) => {
  return <div className="my-3 text-xs">{children}</div>;
};

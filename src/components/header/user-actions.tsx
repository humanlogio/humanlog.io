import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getSelfURL } from "@/lib/config/envs";
import { ReactNode, useState } from "react";
import { useMutation } from "@connectrpc/connect-query";
import { getAuthURL } from "api/js/svc/auth/v1/service-AuthService_connectquery";
import { toast } from "sonner";
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
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { OrgSwitcher } from "@/components/header/org-switcher";
import Link from "next/link";
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { getLogoutURL } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import config from "@/lib/config";
import { SetUserNameModal } from "@/components/header/set-user-name-modal";
import { ThemeToggle } from "@/components/theme-toggle";

interface UserActionsProps {
  userData: WhoamiResponse | undefined;
}

export const UserActions = ({ userData }: UserActionsProps) => {
  const router = useRouter();
  const returnToUrl = `${getSelfURL()}/login`;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: getAuthURLMutation } = useMutation(getAuthURL, {
    onSuccess: (res) => {
      router.push(res.authUrl);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: logoutMutation } = useMutation(getLogoutURL, {
    onSuccess: (res) => {
      document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      localStorage.removeItem("hlog_session");
      router.push(res.logoutUrl);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSignIn = () => {
    const username = localStorage.getItem("username");

    if (username) {
      getAuthURLMutation({ returnToUrl, username });
    } else {
      setIsModalOpen(true);
    }
  };

  const handleModalSubmit = (username: string) => {
    getAuthURLMutation({ returnToUrl, username });
  };

  const handleLogout = () => {
    const returnTo = `${getSelfURL()}/logout`;
    logoutMutation({ returnTo });
  };

  return !userData ? (
    <>
      <SetUserNameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
      <NavigationMenuItem>
        <Button
          variant="link"
          size="sm"
          onClick={handleSignIn}
          className="font-normal"
        >
          Sign In
        </Button>
      </NavigationMenuItem>
    </>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-md p-1 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={gravatarURL(userData.user?.email)} />
            <AvatarFallback className="uppercase">
              {userData.user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]" sideOffset={12}>
        <div className="px-2 py-1.5">
          <SectionTitle>Current Organization</SectionTitle>
          <div className="mt-1">
            <OrgSwitcher userData={userData} />
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

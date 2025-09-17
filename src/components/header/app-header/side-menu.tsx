import { OrgSwitcher } from "@/components/header/app-header/org-switcher";
import { findDeepestFirstPath } from "@/lib/contents";
import { navItems } from "@/app/docs/layout";
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { useRouter } from "next/navigation";
import { useAllEnvironments } from "@/context/list-environments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building,
  ChevronRight,
  CreditCard,
  FileText,
  HardDrive,
  LogOut,
  UserIcon,
  Users,
} from "lucide-react";
import { gravatarURL } from "@/lib/utils/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/mode-toggle";

interface SideMenuProps {
  userInfo: WhoamiResponse;
}

export const SideMenu = ({ userInfo }: SideMenuProps) => {
  const router = useRouter();
  const { doLogout } = useAllEnvironments();

  const handleLogout = () => {
    doLogout();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col">
      {/* User Info Section */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={gravatarURL(userInfo.user?.email)} />
          <AvatarFallback className="uppercase">
            {userInfo.user?.firstName?.slice(0, 2) || <UserIcon size={20} />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="text-sm font-semibold">
            {userInfo.user?.firstName && userInfo.user?.lastName
              ? `${userInfo.user.firstName} ${userInfo.user.lastName}`
              : userInfo.user?.username || "User"}
          </div>
          <div className="text-muted-foreground text-xs">
            {userInfo.user?.email}
          </div>
        </div>
      </div>

      <Separator className="my-2" />
      <div className="px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          Current Organization
        </div>
        <OrgSwitcher userInfo={userInfo} />
      </div>

      <Separator className="my-2" />

      {/* Settings Section */}
      <div className="px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          Settings
        </div>
        <div className="space-y-1">
          <Link
            href="/settings/users"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <Users size={16} className="mr-3" />
            <span className="text-sm">User</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
          <Link
            href="/settings/org"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <Building size={16} className="mr-3" />
            <span className="text-sm">Organization</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Navigation Section */}
      <div className="px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          Navigation
        </div>
        <div className="space-y-1">
          <Link
            href={findDeepestFirstPath(navItems[0])}
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <FileText size={16} className="mr-3" />
            <span className="text-sm">Docs</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
          <Link
            href="/pricing"
            className="flex h-auto w-full justify-start px-2 py-2"
          >
            <CreditCard size={16} className="mr-3" />
            <span className="text-sm">Pricing</span>
            <ChevronRight size={14} className="ml-auto" />
          </Link>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Logout Section - Bottom */}
      <div className="mt-auto p-4">
        <Separator className="mb-4" />
        <div className="flex justify-between">
          <Button
            variant="ghost"
            className="h-auto justify-start px-2 py-2"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            <span className="text-sm">Log out</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

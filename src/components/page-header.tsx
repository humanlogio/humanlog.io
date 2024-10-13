"use client";

import React, { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader, SquareCode, User as UserIcon, LogOut } from "lucide-react";
import Logo from "@/components/logo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { WidthToggle } from "@/components/width-toggle";
import { useApiClients } from "@/context/api-provider";
import { useFullWidth } from "@/context/full-width-provider";
import {
  GetAuthURLRequest,
  LocalhostViaBrowser,
} from "api/js/svc/auth/v1/service_pb";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { User } from "api/js/types/v1/user_pb";
import { md5 } from "js-md5";
import { useAllAccounts } from "@/context/listAccounts";
import { Button } from "./ui/button";

const PageHeader: React.FC = () => {
  const signupOnly = process.env.NEXT_PUBLIC_SIGNUP_ONLY === "true";
  const [activeAccount, setActiveAccount] = useState("france");
  const [authURL, setAuthURL] = useState<string | null>(null);
  const apiClients = useApiClients();
  const { isFullWidth, setIsFullWidth } = useFullWidth();
  const pathname = usePathname();
  const { user, hasLocalhost, listAccounts } = useAllAccounts();
  const localhostValue = "localhost";
  const addNewValue = "add_new";

  useEffect(() => {
    (async () => {
      const returnToUrl = window.location.href;
      const req = new GetAuthURLRequest({ returnToUrl: returnToUrl });
      if (hasLocalhost?.meta) {
        req.localhost = new LocalhostViaBrowser({
          claimAccountId: hasLocalhost.meta.accountId,
          claimMachineId: hasLocalhost.meta.machineId,
          architecture: hasLocalhost.architecture,
          operatingSystem: hasLocalhost.operatingSystem,
          usingVersion: hasLocalhost.clientVersion,
        });
      }
      try {
        const res = await apiClients?.auth.getAuthURL(req);
        if (!res || !res.authUrl) {
          return;
        }
        console.log("set the auth URL, returning to: " + returnToUrl);
        setAuthURL(res.authUrl);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [
    apiClients?.auth,
    hasLocalhost,
    hasLocalhost?.meta,
    hasLocalhost?.meta?.accountId,
    hasLocalhost?.meta?.machineId,
    hasLocalhost?.architecture,
    hasLocalhost?.operatingSystem,
    hasLocalhost?.clientVersion,
  ]);

  useEffect(() => {
    if (activeAccount === localhostValue) {
      if (!hasLocalhost) {
        redirect("install");
      }
    } else if (activeAccount === addNewValue) {
    } else {
      console.log("opening account", activeAccount);
    }
  }, [activeAccount, hasLocalhost]);

  const renderAvatarBlock = (user: User | null) => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer flex-row items-center gap-2">
              <p className="font-medium text-white">
                {user?.firstName || "username"}
              </p>
              <Avatar>
                <AvatarImage src={gravatarURL(user?.email)} />
                <AvatarFallback className="uppercase">
                  {user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>
              <LogOut size={16} className="mr-2" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else if (authURL) {
      return (
        <Link href={authURL}>
          <Button variant="neutral">Sign up</Button>
        </Link>
      );
    }
    return <Loader color="white" className="animate-spin" />;
  };

  const renderSourceSelectorBlock = () => (
    <div title="Account Selector">
      <Select onValueChange={setActiveAccount}>
        <SelectTrigger className="min-w-52">
          <div className="flex flex-row items-center gap-2">
            <SquareCode size={16} />
            <SelectValue placeholder="Select source" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={localhostValue}>
              localhost{" "}
              {hasLocalhost
                ? localhostVersion(hasLocalhost)
                : "unavailable :( -> install it?"}
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            {listAccounts.map((item) => (
              <SelectItem
                value={item.account?.name ?? ""}
                key={item.account?.name ?? ""}
              >
                {item.account?.name}
              </SelectItem>
            ))}
            <SelectItem value={addNewValue}>+ Add new</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="bg-darkBg dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-screen-xl flex-row items-center justify-between gap-8 px-4 py-3">
        <div className="flex flex-row items-center gap-8">
          <Logo />
          {!signupOnly && renderSourceSelectorBlock()}
        </div>
        <div className="flex flex-row items-center gap-6">
          {!signupOnly && (
            <Link href="/pricing" className="text-white hover:underline">
              Pricing
            </Link>
          )}
          {renderAvatarBlock(user)}
          <div className="flex flex-row items-center gap-2">
            <ModeToggle />
            {pathname === "/" && (
              <WidthToggle
                isFullWidth={isFullWidth}
                setIsFullWidth={setIsFullWidth}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const localhostVersion = (res: PingResponse) => {
  const v = res.clientVersion!;
  return "v" + v.major + "." + v.minor + "." + v.patch;
};

export const gravatarURL = (email: string | undefined) => {
  if (!email) return undefined;
  return `https://www.gravatar.com/avatar/${md5(email)}`;
};

export default PageHeader;

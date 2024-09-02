"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
import { useFullWidth } from "@context/full-width-provider";
import { GetAuthURLRequest, LocalhostViaBrowser } from "api/js/svc/auth/v1/service_pb";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";

import { Code, ConnectError } from "@connectrpc/connect";
import { User } from "api/js/types/v1/user_pb";
import { md5 } from "js-md5";
import { Button } from "./ui/button";
import Link from "next/link";

const PageHeader: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authURL, setAuthURL] = useState<string | null>(null);
  const [hasLocalhost, setHasLocalhost] = useState<PingResponse | null>(null);
  const apiClients = useApiClients();
  const { isFullWidth, setIsFullWidth } = useFullWidth();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.user.whoami({});
        if (!res || !res.user) {
          return;
        }
        setUser(res.user);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unauthenticated) {
          console.log("need to auth");
        } else {
          console.error(err);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.localhost.ping({});
        if (!res) {
          setHasLocalhost(null);
          return;
        }
        setHasLocalhost(res);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unauthenticated) {
          console.log("need to auth");
        } else {
          console.error(err);
        }
      }
    })();
  }, []);

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
        })
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
  });

  let avatarBlock = <Loader color="white" className="animate-spin" />;
  if (user) {
    avatarBlock = (
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
    avatarBlock = (
      <Link href={authURL}>
        <Button> Sign up</Button>
      </Link>
    );
  }

  return (
    <div className="bg-darkBg dark:bg-secondary-900">
      <div className="mx-auto flex w-full max-w-screen-xl flex-row items-center justify-between gap-8 px-4 py-3">
        <div className="flex flex-row items-center gap-8">
          <Logo />
          <Select>
            <SelectTrigger className="min-w-52">
              <div className="flex flex-row items-center gap-2">
                <SquareCode size={16} />
                <SelectValue placeholder="Select source" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="localhost">
                  localhost{" "}
                  {hasLocalhost
                    ? "v" +
                    hasLocalhost.clientVersion?.major +
                    "." +
                    hasLocalhost.clientVersion?.minor
                    : "unavailable :( -> install it?"}
                </SelectItem>
                <SelectItem value="staging">staging</SelectItem>
                <SelectItem value="production">production</SelectItem>
                <SelectItem value="add_new">+ Add new</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center gap-6">
          {avatarBlock}
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

export const gravatarURL = (email: string | undefined) => {
  if (!email) return undefined;
  return `https://www.gravatar.com/avatar/${md5(email)}`;
};

export default PageHeader;

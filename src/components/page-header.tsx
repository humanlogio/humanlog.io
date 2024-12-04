"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Loader,
  SquareCode,
  User as UserIcon,
  LogOut,
  Menu,
} from "lucide-react";
import Logo from "@/components/logo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { gravatarURL, getEnvUrl } from "@/lib/utils";
import { useAllEnvironments, UserState } from "@/context/list-environments";
import { Button } from "@/components/ui/button";
import { useQuery } from "@connectrpc/connect-query";
import { getLogoutURL } from "api/js/svc/user/v1/service-UserService_connectquery";

const PageHeader: React.FC = () => {
  const signupOnly = process.env.NEXT_PUBLIC_SIGNUP_ONLY === "true";
  const [authURL, setAuthURL] = useState<string | null>(null);
  const { apiClients, activeEnvironment, setActiveEnvironment, doLogout } =
    useApiClients();
  const { isFullWidth, setIsFullWidth } = useFullWidth();
  const pathname = usePathname();
  const { user, currentOrg, defaultOrg, hasLocalhost, listEnvironments } =
    useAllEnvironments();
  const localhostValue = "localhost";
  const addNewValue = "add-new";
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const returnToUrl = window.location.href;
      const req = new GetAuthURLRequest({ returnToUrl: returnToUrl });
      if (hasLocalhost?.meta) {
        req.localhost = new LocalhostViaBrowser({
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
        setAuthURL(res.authUrl);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [
    apiClients?.auth,
    hasLocalhost,
    hasLocalhost?.meta,
    hasLocalhost?.meta?.machineId,
    hasLocalhost?.architecture,
    hasLocalhost?.operatingSystem,
    hasLocalhost?.clientVersion,
  ]);

  const updateSelection = useCallback(
    (selectValue: string) => {
      if (selectValue === localhostValue) {
        setActiveEnvironment(undefined);
        if (!hasLocalhost) {
          router.push("/install");
        } else {
          router.push("/");
        }
        return;
      }
      if (selectValue === addNewValue) {
        setActiveEnvironment(undefined);
        router.push("/env/new");
        return;
      }
      try {
        setActiveEnvironment(BigInt(selectValue));
        const envName = listEnvironments.find(
          (env) => `${env.environment?.id}` === selectValue,
        );
        if (envName) {
          router.push(`/env/${envName}`);
        }
      } catch (e) {
        console.error("Error attempting to parse environment ID:", selectValue);
        console.error(e);
      }
    },
    [router, hasLocalhost, setActiveEnvironment],
  );

  const logoutURL = useQuery(getLogoutURL).data?.logoutUrl!;

  const renderAvatarBlock = (user: UserState) => {
    if (user === "loading" || !authURL) {
      return <Loader className="animate-spin md:text-white" />;
    }
    if (user === "not-logged-in") {
      return (
        <Link href={authURL}>
          <Button variant="noShadowNeutral" className="w-full">
            Sign up
          </Button>
        </Link>
      );
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex cursor-pointer flex-row items-center gap-2 md:flex-row-reverse">
            <Avatar>
              <AvatarImage src={gravatarURL(user?.email)} />
              <AvatarFallback className="uppercase">
                {user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium dark:text-white md:order-1 md:text-white">
              {user?.firstName || "username"}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <Link href={logoutURL!}>
            <DropdownMenuItem onClick={doLogout}>
              <LogOut size={16} className="mr-2" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderSourceSelectorBlock = () => (
    <div title="Environment Selector" className="w-full md:min-w-52">
      <Select
        value={activeEnvironment?.toString()}
        onValueChange={updateSelection}
      >
        <SelectTrigger className="w-full">
          <div className="flex flex-row items-center gap-2">
            <SquareCode size={16} />
            <SelectValue placeholder="Select source" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem className="cursor-pointer" value={localhostValue}>
              localhost{" "}
              {hasLocalhost
                ? localhostVersion(hasLocalhost)
                : "unavailable :( -> install it?"}
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            {listEnvironments.map((item) =>
              item.environment?.id ? (
                <SelectItem
                  className="cursor-pointer"
                  value={`${item.environment.id}`}
                  key={`${item.environment.name}-${item.environment.id}`}
                >
                  {item.environment?.name}
                </SelectItem>
              ) : (
                <></>
              ),
            )}
            <SelectSeparator />
            <SelectItem className="cursor-pointer" value={addNewValue}>
              + Add new
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <header className="bg-darkBg dark:bg-slate-950">
      <div className="container flex flex-row items-center justify-between gap-8 py-3">
        <div className="hidden w-full flex-row items-center justify-between gap-8 md:flex">
          <div className="flex flex-row items-center gap-8">
            <Logo />
            {!signupOnly && renderSourceSelectorBlock()}
          </div>

          <div className="flex flex-row items-center gap-6">
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
        <div className="md:hidden">
          <Logo />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="neutral" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start dark:bg-darkBg">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex w-full grow flex-col gap-8">
              {!signupOnly && renderSourceSelectorBlock()}
              {renderAvatarBlock(user)}
            </div>
            <ModeToggle />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

const localhostVersion = (res: PingResponse) => {
  const v = res.clientVersion!;
  return "v" + v.major + "." + v.minor + "." + v.patch;
};

export default PageHeader;

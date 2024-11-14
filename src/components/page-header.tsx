"use client";

import React, { useCallback, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
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
import { User } from "api/js/types/v1/user_pb";
import { gravatarURL } from "@/lib/utils";
import { useAllAccounts } from "@/context/listAccounts";
import { Button } from "./ui/button";

const PageHeader: React.FC = () => {
  const signupOnly = process.env.NEXT_PUBLIC_SIGNUP_ONLY === "true";
  const [authURL, setAuthURL] = useState<string | null>(null);
  const { apiClients, activeAccount, setActiveAccount } = useApiClients();
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
          claimAccountId: hasLocalhost.meta.environmentId,
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
        setAuthURL(res.authUrl);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [
    apiClients?.auth,
    hasLocalhost,
    hasLocalhost?.meta,
    hasLocalhost?.meta?.environmentId,
    hasLocalhost?.meta?.machineId,
    hasLocalhost?.architecture,
    hasLocalhost?.operatingSystem,
    hasLocalhost?.clientVersion,
  ]);

  const updateSelection = useCallback(
    (selectValue: string) => {
      if (selectValue === localhostValue) {
        setActiveAccount(undefined);
        if (!hasLocalhost) {
          redirect("install");
        }
      } else if (selectValue === addNewValue) {
        redirect("pricing");
      } else {
        try {
          setActiveAccount(BigInt(selectValue));
        } catch (e) {
          console.error("Error attempting to parse environment ID:", selectValue);
          console.error(e);
        }
      }
    },
    [hasLocalhost, setActiveAccount],
  );

  const renderAvatarBlock = (user: User | null) => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer flex-row items-center gap-2">
              <Avatar>
                <AvatarImage src={gravatarURL(user?.email)} />
                <AvatarFallback className="uppercase">
                  {user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-text md:order-1 md:text-white">
                {user?.firstName || "username"}
              </p>
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
          <Button variant="noShadowNeutral" className="w-full">
            Sign up
          </Button>
        </Link>
      );
    }
    return <Loader className="animate-spin md:text-white" />;
  };

  const renderSourceSelectorBlock = () => (
    <div title="Account Selector" className="w-full md:min-w-52">
      <Select value={activeAccount?.toString()} onValueChange={updateSelection}>
        <SelectTrigger className="w-full">
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
            {listAccounts.map((item) =>
              item.environment?.id ? (
                <SelectItem
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
            <SelectItem value={addNewValue}>+ Add new</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <header className="bg-darkBg dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-screen-xl flex-row items-center justify-between gap-8 px-4 py-3">
        <div className="hidden w-full flex-row items-center justify-between gap-8 md:flex">
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
        <div className="md:hidden">
          <Logo />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="neutral" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex w-full grow flex-col gap-8">
              {!signupOnly && renderSourceSelectorBlock()}
              {renderAvatarBlock(user)}
              {!signupOnly && (
                <Link href="/pricing" className="hover:underline md:text-white">
                  Pricing
                </Link>
              )}
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

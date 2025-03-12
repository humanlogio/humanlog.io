"use client";

import React, { useEffect, useState } from "react";
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
import { useApiClients } from "@/context/api-provider";
import { useFullWidth } from "@/context/full-width-provider";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { gravatarURL, getEnvUrl, getUserSettingsUrl } from "@/lib/utils";
import { useAllEnvironments, UserState } from "@/context/list-environments";
import { Button } from "@/components/ui/button";
import config from "@/features/config";
import dynamic from "next/dynamic";
import { getFirstDoc } from "@/lib/docs";

const WidthToggle = dynamic(() => import("@/components/width-toggle"), {
  ssr: false,
});

interface Source {
  name: string;
  path: string;
  value: string;
}

const navLinks = [
  {
    href: `${getFirstDoc()?.fullPath}`,
    text: "Docs",
  },
  {
    href: "/blog",
    text: "Blog",
  },
  {
    href: "/pricing",
    text: "Pricing",
  },
];

const PageHeader: React.FC = () => {
  const pathname = usePathname();
  const isProd = config.NEXT_IS_PROD;

  const { setActiveEnvironment, doLogout } = useApiClients();
  const { isFullWidth, setIsFullWidth } = useFullWidth();

  const {
    user,
    localhostInfo,
    currentOrg,
    defaultOrg,
    listEnvironments,
    doLogin,
  } = useAllEnvironments();

  const [sources, setSources] = useState<Source[]>();
  const [selected, setSelected] = useState<Source>();

  const router = useRouter();

  const updateSelection = (value: string) => {
    const _selected = sources?.find((source) => source.value === value);
    if (_selected) {
      const selectedEnv = listEnvironments.find(
        (env) => `${env.environment?.id}` === _selected.value,
      );

      selectedEnv
        ? setActiveEnvironment(selectedEnv.environment)
        : setActiveEnvironment(undefined);
      setSelected(_selected);
      router.push(_selected?.path);
    }
  };

  useEffect(() => {
    let _sources: { name: string; path: string; value: string }[] = [];
    const path = localhostInfo
      ? {
          name: `localhost ${localhostVersion(localhostInfo)}`,
          path: "/localhost",
          value: "localhost",
        }
      : {
          name: `localhost unavailable :( -> install it?`,
          path: "/install",
          value: "install",
        };
    _sources.push(path);

    if (!isProd) {
      if (listEnvironments.length > 0) {
        listEnvironments.forEach((list, i) => {
          if (list.environment) {
            const orgName =
              currentOrg?.id && currentOrg?.id !== defaultOrg?.id
                ? currentOrg.name
                : undefined;

            _sources.push({
              name: list.environment.name,
              path: getEnvUrl(list?.environment?.name as string, orgName),
              value: `${list.environment.id}`,
            });
          }
        });
      }

      _sources.push({
        name: "+ Add new",
        path: !defaultOrg && !currentOrg ? "/pricing" : "/env/new",
        value: "add-new",
      });
    }
    setSources(_sources);
  }, [listEnvironments, localhostInfo, pathname, user]);

  useEffect(() => {
    if (pathname === "/") {
      setSelected(undefined);
      return;
    }
    const _selected = sources?.find((source) => source.path === pathname);
    setSelected(_selected);
  }, [pathname, sources]);

  const renderAvatarBlock = (user: UserState) => {
    if (user === "loading") {
      return <Loader className="animate-spin md:text-white" />;
    }
    if (user === "not-logged-in") {
      return (
        <Button
          onClick={() => doLogin()}
          variant="noShadowNeutral"
          className="w-full"
        >
          Sign up
        </Button>
      );
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="flex cursor-pointer flex-row items-center gap-2 md:flex-row-reverse"
            aria-label="user-dropdown"
          >
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
          <Link href={getUserSettingsUrl()}>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={doLogout} aria-label="logout">
            <LogOut size={16} className="mr-2" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderSourceSelectorBlock = () => (
    <div
      title="Environment Selector"
      className="flex w-full items-center gap-2 md:min-w-52"
    >
      <Select value={selected?.value || ""} onValueChange={updateSelection}>
        <SelectTrigger className="w-full">
          <div className="flex flex-row items-center gap-2">
            <SquareCode size={16} />
            <SelectValue placeholder="Select source" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sources?.map((source, i) => {
              return (
                <SelectItem
                  className="cursor-pointer"
                  key={i}
                  value={source?.value || ""}
                >
                  {source.name}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div
        className={`h-3 w-3 shrink-0 rounded-full ${localhostInfo ? "bg-green-500" : "bg-red-500"}`}
      />
    </div>
  );

  const renderNavBlock = () => {
    return (
      !isProd && (
        <div className="flex flex-col gap-3 md:flex-row">
          {navLinks.map((link, i) => {
            return (
              <Link
                href={link.href}
                key={i}
                className="transition-colors hover:underline md:text-main md:hover:text-white"
              >
                {link.text}
              </Link>
            );
          })}
        </div>
      )
    );
  };

  return (
    <header className="bg-darkBg dark:bg-slate-950">
      <div className="container flex flex-row items-center justify-between gap-8 py-3">
        <div className="hidden w-full flex-row items-center justify-between gap-8 md:flex">
          <div className="flex flex-row items-center gap-8">
            <Logo />
            {renderSourceSelectorBlock()}
          </div>
          <div className="flex flex-row items-center gap-4">
            {renderNavBlock()}
            <div className="ml-4 flex flex-row items-center gap-4">
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
              {renderSourceSelectorBlock()}
              {renderAvatarBlock(user)}
              {renderNavBlock()}
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

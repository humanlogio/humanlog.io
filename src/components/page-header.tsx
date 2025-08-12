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
  Copy,
  Check,
  Sparkles,
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
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { gravatarURL } from "@/lib/utils/avatar";
import { getEnvUrl, getUserSettingsUrl } from "@/lib/utils/navigation";
import { useAllEnvironments, UserState } from "@/context/list-environments";
import { Button } from "@/components/ui/button";
import config from "@/features/config";
import { GetNextUpdateRequest } from "api/js/svc/cliupdate/v1/service_pb";
import { versionCompare, versionToString } from "@/lib/utils/version";
import { Version } from "api/js/types/v1/version_pb";
import { copyToClipboard } from "@/lib/utils/clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useQuery } from "@connectrpc/connect-query";
import { getNextUpdate } from "api/js/svc/cliupdate/v1/service-UpdateService_connectquery";

interface Source {
  name: string;
  path: string;
  value: string;
}

const navLinks = [
  {
    href: "/docs/get-started/introduction",
    text: "Docs",
  },
  // TODO: when blog is ready
  // {
  //   href: "/blog",
  //   text: "Blog",
  // },
  {
    href: "/pricing",
    text: "Pricing",
  },
];

const PageHeader: React.FC = () => {
  const pathname = usePathname();
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  const { setActiveEnvironment, apiClients, activeEnvironment } =
    useApiClients();
  const { doLogout, allowedUsage, localhostConfig } = useAllEnvironments();

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
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [nextVersion, setNextVersion] = useState<Version>();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const router = useRouter();

  const { data: updateData } = useQuery(getNextUpdate);

  // getNextUpdate(apiClients?.update, req, {
  //   onSuccess: (res) => {
  //     const result = versionCompare(
  //       localhostInfo.clientVersion as Version,
  //       res.nextVersion as Version,
  //     );
  //     setNextVersion(res.nextVersion as Version);

  //     if (result < 0) setIsUpdateAvailable(true);
  //   },
  // });

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
    const _selected = sources?.find((source) => pathname.includes(source.path));
    setSelected(_selected);
  }, [pathname, sources]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!apiClients || !localhostInfo || !localhostConfig) return;
    const req = new GetNextUpdateRequest({
      projectName: "humanlog",
      currentVersion: localhostInfo.clientVersion,
      machineArchitecture: localhostInfo.architecture || "",
      machineOperatingSystem: localhostInfo.operatingSystem || "",
      meta: localhostInfo.meta,
      releaseChannelName:
        localhostConfig?.runtime?.experimentalFeatures?.releaseChannel || "",
    });

    if (updateData) {
      const result = versionCompare(
        localhostInfo.clientVersion as Version,
        updateData.nextVersion as Version,
      );
      setNextVersion(updateData.nextVersion as Version);

      if (result < 0) setIsUpdateAvailable(true);
    }
  }, [localhostInfo, localhostConfig]);

  const handleCopyCommand = async () => {
    const success = await copyToClipboard(
      "humanlog version update",
      "Update command",
    );
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const renderAvatarBlock = (user: UserState) => {
    if (user === "loading") {
      return <Loader className="animate-spin md:text-white" />;
    }
    if (user === "not-logged-in") {
      return (
        <Button onClick={() => doLogin()} variant="outline" className="w-full">
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
            <div className="relative">
              <Avatar>
                <AvatarImage src={gravatarURL(user?.email)} />
                <AvatarFallback className="uppercase">
                  {user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
                </AvatarFallback>

                <div
                  className={`absolute bottom-0 left-0 z-10 h-3 w-3 rounded-full ${allowedUsage === 2 && "bg-emerald-500"}`}
                />
              </Avatar>
            </div>
            <div className="text-end">
              <p className="font-medium whitespace-nowrap md:order-1">
                {user?.username ?? user.firstName}
              </p>
              {allowedUsage === 1 ? (
                <p className="text-xs text-orange-400">Personal use</p>
              ) : allowedUsage === 2 ? (
                <p className="text-xs text-emerald-500">Pro</p>
              ) : (
                <></>
              )}
            </div>
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={`h-3 w-3 shrink-0 rounded-full ${localhostInfo ? "bg-green-500" : "bg-red-500"} ${isUpdateAvailable && "animate-pulse"}`}
            />
          </TooltipTrigger>
          {isUpdateAvailable && (
            <TooltipContent className="max-w-sm bg-transparent p-0 shadow-none">
              <div className="border-muted space-y-3 rounded-lg border bg-white p-4 shadow-lg dark:bg-black">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} />
                  <h3 className="text-sm font-semibold">Update Available</h3>
                </div>

                {localhostInfo?.clientVersion && (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-mono">
                        {versionToString(localhostInfo.clientVersion)}
                      </span>
                    </div>
                    {nextVersion && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Next:</span>
                        <span className="font-mono">
                          {versionToString(nextVersion)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-2">
                  <p className="text-muted-foreground mb-2 text-xs">
                    Run this command to update:
                  </p>
                  <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                    <code className="flex-1 font-mono text-xs">
                      humanlog version update
                    </code>
                    {isCopied ? (
                      <Check size={12} />
                    ) : (
                      <Copy
                        size={12}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={handleCopyCommand}
                      />
                    )}
                  </div>
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const renderNavBlock = () => {
    return (
      <div className="flex flex-col gap-3 md:flex-row">
        {navLinks.map((link, i) => {
          return (
            <Link href={link.href} key={i} className="hover:underline">
              {link.text}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <header className="bg-muted sticky top-0 left-0 z-30">
      <div className="flex flex-row items-center justify-between gap-8 px-2 py-2 md:container">
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
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <Logo />
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="dark:bg-darkBg flex flex-col items-start">
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

"use client";

import React, { useEffect, useState } from "react";
import { SquareCode, User as UserIcon } from "lucide-react";
import Logo from "@/components/logo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { WidthToggle } from "@/components/width-toggle";
import { useApiClients } from "@/context/api-provider";
import { createPromiseClient, Code, ConnectError } from "@connectrpc/connect";
import { User } from "api/js/types/v1/user_pb";
import { md5 } from "js-md5";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageHeaderProps {
  isFullWidth: boolean;
  setIsFullWidth: React.Dispatch<React.SetStateAction<boolean>>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  isFullWidth,
  setIsFullWidth,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authURL, setAuthURL] = useState<string | null>(null);
  const apiClients = useApiClients();

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
        const res = await apiClients?.auth.getAuthURL({})
        if (!res || !res.authUrl) {
          return;
        }
        console.log("set the auth URL");
        setAuthURL(res.authUrl);
      } catch (err) {
        console.log(err);
      }
    })();
  })

  let avatarBlock = <></>
  if (user) {
    avatarBlock = <><p className="font-medium text-white">
      {user?.firstName || "username"}
    </p>
      <Avatar>
        <AvatarImage src={gravatarURL(user?.email)} />
        <AvatarFallback className="uppercase">
          {user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
        </AvatarFallback>
      </Avatar>
    </>
  } else if (authURL) {
    avatarBlock = <>
      <p className="font-medium text-white">
        <Link href={authURL}>
          <Button> Sign up</Button>
        </Link>
      </p >
    </>
  }

  return (
    <div className="bg-darkBg dark:bg-secondary-900">
      <div className="mx-auto flex w-full max-w-screen-xl flex-row items-center justify-between gap-8 px-4 py-3">
        <div className="flex flex-row items-center gap-8">
          <Logo />
          <Select>
            <SelectTrigger className="w-52">
              <div className="flex flex-row items-center gap-2">
                <SquareCode size={16} />
                <SelectValue placeholder="Select source" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="localhost">localhost</SelectItem>
                <SelectItem value="staging">staging</SelectItem>
                <SelectItem value="production">production</SelectItem>
                <SelectItem value="add_new">+ Add new</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center gap-6">
          <div className="flex flex-row items-center gap-2">
            {avatarBlock}
          </div>
          <div className="flex flex-row items-center gap-2">
            <ModeToggle />
            <WidthToggle
              isFullWidth={isFullWidth}
              setIsFullWidth={setIsFullWidth}
            />
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

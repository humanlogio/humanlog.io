"use client";

import Logo from "./logo";
import Link from "next/link";
import { Loader, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "api/js/types/v1/user_pb";
import { gravatarURL } from "@/lib/utils";
import { useAllAccounts } from "@/context/listAccounts";
import { Button } from "./ui/button";
import { useState } from "react";
import Image from "next/image";

const PageFooter = (props: {
  iconSocialLinks: { href: string; icon: string; alt: string }[];
  footerLinks: { href: string; text: string }[];
}) => {
  const { footerLinks, iconSocialLinks } = props;
  const [authURL, setAuthURL] = useState<string | null>(null);
  const { user } = useAllAccounts();

  const renderAvatarBlock = (user: User | null) => {
    if (user) {
      return (
        <div className="flex w-full cursor-pointer flex-row items-center justify-center gap-2">
          <p className="font-medium text-white md:order-2">
            {user?.firstName || "username"}
          </p>
          <Avatar>
            <AvatarImage src={gravatarURL(user?.email)} />
            <AvatarFallback className="uppercase">
              {user?.firstName?.slice(0, 2) || <UserIcon size={16} />}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    } else if (authURL) {
      return (
        <Link href={authURL}>
          <Button variant="neutral">Sign up</Button>
        </Link>
      );
    }
    return <Loader className="animate-spin md:text-white" />;
  };

  return (
    <footer className="bg-darkBg py-10 text-slate-100 dark:bg-slate-950">
      <div className="container">
        <div className="grid grid-cols-1 justify-items-center gap-6 text-center md:grid-cols-12 lg:gap-0">
          <div className="flex flex-col justify-between gap-7 pb-1 md:col-span-3 md:justify-self-start">
            <a
              className="contents"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Logo small />
            </a>

            <div className="flex items-center justify-center gap-4 md:justify-between">
              {Object.values(iconSocialLinks).map((link) => (
                <a
                  className="contents"
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    className="col-start-3 w-6 justify-self-end"
                    src={link.icon}
                    alt={link.alt}
                    width={21}
                    height={21}
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="lx:col-span-3 grid grid-cols-1 items-end gap-2 py-1 text-sm text-white md:col-span-5 md:w-full md:grid-flow-col-dense md:grid-rows-3 md:justify-self-start md:py-0 md:text-left lg:gap-x-24">
            {Object.values(footerLinks).map((link) => (
              <a
                className="text-main transition-colors hover:text-slate-100"
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.text}
              </a>
            ))}
          </div>

          <div className="lx:col-span-2 hidden md:col-span-1 md:block" />

          <div className="flex flex-col items-center justify-between gap-4 md:col-span-3 md:items-end md:justify-self-end">
            <div className="flex flex-row items-center gap-6">
              {renderAvatarBlock(user)}
            </div>

            <div className="text-neutral-grayish-blue text-xs md:text-sm">
              <p>© Humanlog</p>
              <p>All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;

"use client";

import Logo from "./logo";
import Link from "next/link";
import { Loader, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "api/js/types/v1/user_pb";
import { gravatarURL } from "@/lib/utils";
import { useAllEnvironments } from "@/context/listEnvironments";
import { Button } from "./ui/button";
import { useState } from "react";
import Image from "next/image";

const iconSocialLinks = [
  {
    href: "https://github.com/humanlogio/humanlog",
    icon: "/icons/github-mark-white.svg",
    alt: "GitHub",
  },
];

const footerLinks = [
  {
    href: "mailto:antoine@webscale.lol",
    text: "Contact Us",
  },
  {
    href: "/legal/siteterms",
    text: "Terms of Service",
  },
  {
    href: "/legal/privacy",
    text: "Privacy Policy",
  },
];

const PageFooter = () => {
  const [authURL, setAuthURL] = useState<string | null>(null);
  const { user } = useAllEnvironments();

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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="flex flex-col items-center gap-6 md:col-span-6 md:items-start">
            <Logo sm />

            <div className="flex items-center gap-4">
              {Object.values(iconSocialLinks).map((link) => (
                <a
                  className="contents"
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={link.icon}
                    alt={link.alt}
                    width={24}
                    height={24}
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 md:col-span-3 md:items-start">
            {Object.values(footerLinks).map((link) => (
              <a
                className="text-main transition-colors hover:text-white"
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.text}
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 md:col-span-3 md:items-end md:text-end">
            {renderAvatarBlock(user)}
            <p className="text-white">
              2024 © Humanlog.io
              <br />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;

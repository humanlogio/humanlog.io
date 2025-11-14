"use client";

import { UserActions } from "@/components/header/user-actions";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useUser } from "@/hooks/useUser";
import { EnvSwitcher } from "@/components/header/env-switcher";
import { BetaBadge } from "@/components/beta-badge";
import { Logo } from "@/components/header/logo";
import { useUserStore } from "@/stores/user-store";

const navItems = [
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

export const Header = () => {
  // const { userData, isLoadingUser } = useUser();
  const { user } = useUserStore();

  return (
    <NavigationMenu>
      <NavigationMenuList className="fixed top-0 z-20 flex h-12 w-full items-center justify-between border-b bg-neutral-50 px-5 dark:bg-neutral-950">
        <div
          className={`flex items-center gap-12 ${user && "w-full justify-between"}`}
        >
          <div className="flex items-center gap-12">
            <div className="flex items-center">
              <Logo user={user} />

              <BetaBadge />
            </div>
            {user && <EnvSwitcher user={user} />}
          </div>

          <div className="mr-5 flex items-center gap-3">
            {navItems.map((item) => {
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className={`${navigationMenuTriggerStyle()} bg-neutral-50 dark:bg-neutral-950`}
                  >
                    {item.text}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </div>
        </div>
        <UserActions user={user} />
      </NavigationMenuList>
    </NavigationMenu>
  );
};

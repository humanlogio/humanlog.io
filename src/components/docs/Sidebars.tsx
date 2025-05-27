"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { NavItem as NavItemType } from "@/lib/contents";

interface DocsSidebarProps {
  navItems: NavItemType[];
}

export function DocsSidebar({ navItems }: DocsSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-64 flex-shrink-0 overflow-y-auto border-r p-4 md:block">
        <div className="mb-6 text-xl font-bold">Docs</div>
        <nav>
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="absolute top-20 right-4 rounded border p-1 md:hidden">
            <LayoutList className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent className="dark:bg-darkBg w-full dark:text-white">
          <SheetHeader className="text-left">
            <SheetTitle>Docs</SheetTitle>
          </SheetHeader>
          <nav className="mt-8">
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

export const NavItem = ({ item }: { item: NavItemType }) => {
  const pathname = usePathname();

  const itemId = `nav-item-${item.title.replace(/\s+/g, "-").toLowerCase()}`;
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem(itemId);

    if (savedState !== null) {
      setIsOpen(savedState === "true");
    } else {
      if ("items" in item) {
        const shouldOpen = checkIfSectionContainsCurrentPath(item, pathname);
        setIsOpen(shouldOpen);
        if (shouldOpen) {
          localStorage.setItem(itemId, "true");
        }
      } else {
        setIsOpen(false);
      }
    }
  }, [itemId, pathname]);

  const checkIfSectionContainsCurrentPath = (
    item: NavItemType,
    currentPath: string,
  ): boolean => {
    if (!item.children) return false;

    return item.children?.some((subItem) => {
      if ("items" in subItem) {
        return checkIfSectionContainsCurrentPath(
          subItem as NavItemType,
          currentPath,
        );
      } else {
        const itemPath = `/docs/${subItem.title}/${subItem.path}`;
        return currentPath === itemPath;
      }
    });
  };

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem(itemId, String(newState));
  };

  const isSection = "children" in item;
  const hasChildren = isSection && item.children && item.children.length > 0;
  const itemPath = !isSection ? `/docs/${item.title}` : "";
  const isActive = !isSection && pathname === itemPath;

  console.log("item", item);

  if (isOpen === null) return null;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center rounded-md px-4 py-2 hover:underline ${
          isActive ? "bg-slate-100 dark:bg-slate-800" : ""
        }`}
      >
        {hasChildren ? (
          <button className="mr-1 h-4 w-4 p-0" onClick={toggleOpen}>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {!isSection ? (
          <NextLink href={item.path} className="flex-1">
            {item.title}
          </NextLink>
        ) : (
          <div
            className="flex-1 cursor-pointer font-medium"
            onClick={() => hasChildren && toggleOpen()}
          >
            {item.title}
          </div>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-2">
          {(item as NavItemType).children?.map((child, index) => (
            <NavItem key={index} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

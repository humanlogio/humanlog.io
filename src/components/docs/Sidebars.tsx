"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, LayoutList } from "lucide-react";
import { DocItem, DocSection } from "@/types/docs";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

export function DocsSidebar({ docsList }: { docsList: DocSection[] }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-64 flex-shrink-0 overflow-y-auto border-r p-4 md:block">
        <div className="mb-6 text-xl font-bold">Docs</div>
        <nav>
          {docsList.map((section, index) => (
            <NavItem key={index} item={section} />
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
            {docsList.map((section, index) => (
              <NavItem key={index} item={section} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

export const NavItem = ({ item }: { item: DocSection | DocItem }) => {
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
    section: DocSection,
    currentPath: string,
  ): boolean => {
    if (!("items" in section)) return false;

    return section.items.some((subItem) => {
      if ("items" in subItem) {
        return checkIfSectionContainsCurrentPath(
          subItem as DocSection,
          currentPath,
        );
      } else {
        const itemPath = `/docs/${subItem.section}/${subItem.slug}`;
        return currentPath === itemPath;
      }
    });
  };

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem(itemId, String(newState));
  };

  const isSection = "items" in item;
  const hasChildren = isSection && item.items && item.items.length > 0;
  const itemPath = !isSection ? `/docs/${item.section}/${item.slug}` : "";
  const isActive = !isSection && pathname === itemPath;

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
          <NextLink href={itemPath} className="flex-1">
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
          {(item as DocSection).items.map((child, index) => (
            <NavItem key={index} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

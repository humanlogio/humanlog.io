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
import { useState } from "react";
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
          <button className="absolute right-4 top-20 rounded border p-1 md:hidden">
            <LayoutList className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-full dark:bg-darkBg dark:text-white">
          <SheetHeader>
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

const NavItem = ({ item }: { item: DocSection | DocItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isSection = "items" in item;
  const hasChildren = isSection && item.items.length > 0;
  const itemPath = !isSection ? `/docs/${item.section}/${item.slug}` : "";
  const isActive = !isSection && pathname === itemPath;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center rounded-md px-4 py-2 hover:underline ${
          isActive ? "bg-slate-100 dark:bg-slate-800" : ""
        }`}
      >
        {hasChildren ? (
          <button
            className="mr-1 h-4 w-4 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
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
            onClick={() => hasChildren && setIsOpen(!isOpen)}
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

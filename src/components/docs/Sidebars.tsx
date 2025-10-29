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
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import { NavItem as NavItemType } from "@/lib/utils/contents";
import config from "@/lib/config";

interface DocsSidebarProps {
  navItems: NavItemType[];
}

export function DocsSidebar({ navItems }: DocsSidebarProps) {
  // Filter items based on environment
  const filterNavItems = (items: NavItemType[]): NavItemType[] => {
    return items
      .filter((item) => {
        // If devOnly is true, only show in development environment
        if (item.devOnly) {
          return !config.NEXT_PUBLIC_IS_PROD;
        }
        return true;
      })
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filterNavItems(item.children),
          };
        }
        return item;
      });
  };

  const filteredNavItems = filterNavItems(navItems);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-[calc(100vh-3rem)] w-64 flex-shrink-0 overflow-y-auto border-r px-4 py-8 md:block">
        <div className="mb-6 text-xl font-bold">Docs</div>
        <nav>
          {filteredNavItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="bg-muted fixed top-20 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md md:hidden">
            <LayoutList className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-full overflow-y-auto pt-12 dark:bg-black dark:text-white">
          <SheetHeader className="text-left">
            <SheetTitle>Docs</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 pb-20">
            {filteredNavItems.map((item, index) => (
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
  const router = useRouter();
  const [currentHash, setCurrentHash] = useState<string>("");

  const itemId = `nav-item-${item.title.replace(/\s+/g, "-").toLowerCase()}`;
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  // Update the hash whenever it changes in the URL
  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash
        ? window.location.hash.substring(1)
        : "";
      setCurrentHash(hash);
    };

    // Set initial hash
    updateHash();

    // Add hash change event listener
    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  // Ensure component updates when pathname changes
  useEffect(() => {
    // Update hash when pathname changes
    const hash = window.location.hash ? window.location.hash.substring(1) : "";
    setCurrentHash(hash);
  }, [pathname]);

  useEffect(() => {
    const savedState = localStorage.getItem(itemId);

    if (savedState !== null) {
      setIsOpen(savedState === "true");
    } else {
      if (item.children) {
        const shouldOpen = checkIfSectionContainsCurrentPath(item, pathname);
        setIsOpen(shouldOpen);
        if (shouldOpen) {
          localStorage.setItem(itemId, "true");
        }
      } else {
        setIsOpen(false);
      }
    }
  }, [itemId, pathname, item.children]);

  useEffect(() => {
    // Handle hash scrolling when page loads
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname]);

  const checkIfSectionContainsCurrentPath = (
    item: NavItemType,
    currentPath: string,
  ): boolean => {
    if (!item.children) return false;

    return item.children?.some((subItem) => {
      if (subItem.children) {
        return checkIfSectionContainsCurrentPath(subItem, currentPath);
      } else {
        // Check if the current path matches the item path or its path without hash
        const pathWithoutHash = subItem.path.split("#")[0];
        return currentPath === subItem.path || currentPath === pathWithoutHash;
      }
    });
  };

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem(itemId, String(newState));
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.path.includes("#")) {
      e.preventDefault();

      // Navigate to the page first if needed
      const [pagePath, hash] = item.path.split("#");
      const currentPathWithoutHash = pathname.split("#")[0];

      if (pagePath && currentPathWithoutHash !== pagePath) {
        // Different page - navigate to it
        router.push(item.path);
      } else {
        // Same page - just scroll to element
        // Try to find the element by the hash
        let element = document.getElementById(hash);

        // If element not found, try converting hash to a more compatible format
        if (!element) {
          // Try with different case or format transformations
          const alternativeSelectors = [
            hash.toLowerCase(),
            hash.replace(/-/g, " ").toLowerCase(),
            hash.replace(/\s+/g, "-").toLowerCase(),
          ];

          for (const selector of alternativeSelectors) {
            element = document.getElementById(selector);
            if (element) break;
          }
        }

        // If still not found, try finding by text content
        if (!element) {
          const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
          const targetText = hash.replace(/-/g, " ").toLowerCase();

          for (const heading of headings) {
            if (heading.textContent?.toLowerCase().includes(targetText)) {
              element = heading as HTMLElement;
              break;
            }
          }
        }

        if (element) {
          // Scroll to element with some offset for fixed headers
          const yOffset = -80; // Adjust based on your header height
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });

          // Update URL with hash
          window.history.pushState({}, "", item.path);
          setCurrentHash(hash);
          window.dispatchEvent(new Event("hashchange"));
        } else {
          console.warn(`Element with id "${hash}" not found`);

          // Debug: Log all available IDs in the page
          if (process.env.NODE_ENV === "development") {
            const allElementsWithIds = document.querySelectorAll("[id]");
            const allHeadings = document.querySelectorAll(
              "h1, h2, h3, h4, h5, h6",
            );

            console.log(
              "Available element IDs:",
              Array.from(allElementsWithIds).map((el) => el.id),
            );
            console.log(
              "Available headings:",
              Array.from(allHeadings).map((h) => ({
                tag: h.tagName,
                text: h.textContent,
                id: h.id,
              })),
            );
          }

          // Fallback: just update the URL and let browser handle it
          window.location.hash = hash;
        }
      }
    }
  };

  const isSection = item.children && item.children.length > 0;
  const hasChildren = isSection;

  const isActive = (() => {
    // Exact path match
    if (pathname === item.path) return true;

    // Hash path case (e.g., /docs/reference/functions/scalar#abs)
    if (item.path.includes("#")) {
      const [itemBasePath, itemHash] = item.path.split("#");

      // Activate when both base path and hash match
      if (pathname === itemBasePath && currentHash === itemHash) {
        // Only in development, log which item is being activated
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Activating item:",
            item.title,
            "Hash match:",
            currentHash === itemHash,
          );
        }
        return true;
      }
    }

    return false;
  })();

  if (isOpen === null) return null;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center rounded-md px-4 py-2 hover:underline ${
          isActive ? "font-bold" : ""
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
          <NextLink
            href={item.path}
            className="flex-1"
            onClick={item.path.includes("#") ? handleClick : undefined}
          >
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
          {item.children?.map((child, index) => (
            <NavItem key={index} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

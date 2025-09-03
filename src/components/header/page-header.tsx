import { Button } from "@/components/ui/button";
import { useAllEnvironments } from "@/context/list-environments";
import { HexagonIcon } from "lucide-react";
import Link from "next/link";

export const PageHeader = () => {
  const { doLogin } = useAllEnvironments();
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
    <nav className="bg-muted flex w-full flex-col">
      <div className="sticky top-0 z-20">
        <div className="container flex items-center py-2">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="mr-10">
                <HexagonIcon size={16} />
              </Link>
              {renderNavBlock()}
            </div>
            <Button onClick={() => doLogin()} variant="outline" size="sm">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

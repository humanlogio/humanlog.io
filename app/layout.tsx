import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Book, LifeBuoy, Settings2, SquareTerminal, SquareUser, Triangle } from "lucide-react";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import logger from 'pino';
import "./globals.css";
import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";

const log = logger();

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "humanlog.io",
  description: "logs for humans",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >

        <div className="grid h-screen w-full pl-[56px]">
          <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
            <div className="border-b p-2">
              <Button variant="outline" size="icon" aria-label="Home">
                <Link href="/">
                  <Triangle className="size-5 fill-foreground" />
                </Link>
              </Button>
            </div>
            <TooltipProvider>
              <nav className="grid gap-1 p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg"
                      aria-label="Playground"
                    >
                      <Link href="/dashboard">
                        <SquareTerminal className="size-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    Playground
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg"
                      aria-label="Settings"
                    >
                      <Link href="/settings">
                        <Settings2 className="size-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    Settings
                  </TooltipContent>
                </Tooltip>
              </nav>
              <nav className="mt-auto grid gap-1 p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><SignInButton></SignInButton></div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    Account
                  </TooltipContent>
                </Tooltip>
              </nav>
            </TooltipProvider>
          </aside>
          <div className="flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
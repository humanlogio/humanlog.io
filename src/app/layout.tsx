import type { Metadata } from "next";
import { JetBrains_Mono as FontMono } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/theme-provider";
import { ApiClientsProvider } from "@/context/api-provider";
import { FullWidthProvider } from "@/context/full-width-provider";
import { Toaster } from "@/components/ui/sonner";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "humanlog.io",
  description: "Logs for humans to read.",
};

const font = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-bg font-mono text-text antialiased dark:bg-darkBg dark:text-darkText",
          font.variable,
        )}
      >
        <ApiClientsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FullWidthProvider>
              <header>
                <PageHeader />
              </header>
              <main>{children}</main>
              <Toaster expand={true} />
            </FullWidthProvider>
          </ThemeProvider>
        </ApiClientsProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { JetBrains_Mono as FontMono } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/theme-provider";
import { ApiClientsProvider } from "@/context/api-provider";
import { FullWidthProvider } from "@/context/full-width-provider";
import { Toaster } from "@/components/ui/sonner";
import PageHeader from "@/components/page-header";
import { ListEnvironmentsProvider } from "@/context/list-environments";
import PageFooter from "@/components/page-footer";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "h-screen bg-bg font-mono text-text antialiased dark:bg-darkBg dark:text-darkText",
          font.variable,
        )}
      >
        <ApiClientsProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <FullWidthProvider>
              <ListEnvironmentsProvider>
                <div className="flex min-h-screen flex-col">
                  <PageHeader />
                  <div className="container-min-h-full flex flex-1 flex-col">
                    {children}
                  </div>
                  <PageFooter />
                </div>
                <Toaster expand={true} />
              </ListEnvironmentsProvider>
            </FullWidthProvider>
          </ThemeProvider>
        </ApiClientsProvider>
      </body>
    </html>
  );
}

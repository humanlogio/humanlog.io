import type { Metadata } from "next";
import { JetBrains_Mono as FontMono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const font = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "humanlog.io",
  description: "Effortless Log Query",
};

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
        {children}
      </body>
    </html>
  );
}

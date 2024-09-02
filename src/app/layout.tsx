'use client';

import { JetBrains_Mono as FontMono } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/context/theme-provider';
import { ApiClientsProvider } from '@/context/api-provider';
import { FullWidthProvider } from '@context/full-width-provider';
import PageHeader from '@components/page-header';
import Head from 'next/head';

const font = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>humanlog.io</title>
      </Head>
      <body
        className={cn(
          'min-h-screen bg-bg font-mono text-text antialiased dark:bg-darkBg dark:text-darkText',
          font.variable
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
            </FullWidthProvider>
          </ThemeProvider>
        </ApiClientsProvider>
      </body>
    </html>
  );
}

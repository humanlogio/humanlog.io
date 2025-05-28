import { DocsSidebar } from "@/components/docs/Sidebars";
import { ReactNode } from "react";
import path from "path";

import { scanDirectory, NavItem } from "@/lib/contents";
import { reference } from "@/lib/utils/reference";
import config from "@/features/config";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  const navItems: NavItem[] = [
    {
      title: "Get Started",
      path: "/docs/get-started",
      children: [
        {
          title: "Basic Usage",
          path: "/docs/get-started/basic-usage",
          devOnly: true,
        },
        { title: "Installation", path: "/docs/get-started/installation" },
        { title: "Introduction", path: "/docs/get-started/introduction" },
        {
          title: "Alerts Example",
          path: "/docs/get-started/alerts-example",
          devOnly: true,
        },
      ],
    },
    {
      title: "Reference",
      path: "/docs/reference",
      children: [
        {
          title: "Symbols",
          path: "/docs/reference/symbols",
          children: [
            {
              title: "Logs",
              path: "/docs/reference/symbols/logs",
            },
            {
              title: "Spans",
              path: "/docs/reference/symbols/spans",
            },
          ],
        },
        {
          title: "Functions",
          path: "/docs/reference/functions",
          children: [
            {
              title: "Scalar",
              path: "/docs/reference/functions/scalar",
              children: reference.funcs.scalar.map((func) => ({
                title: func.name,
                path: `/docs/reference/functions/scalar#${func.name}`,
              })),
            },
            {
              title: "Aggregate",
              path: "/docs/reference/functions/aggregate",
              children: reference.funcs.aggregate.map((func) => ({
                title: func.name,
                path: `/docs/reference/functions/aggregate#${func.name}`,
              })),
            },
          ],
        },
        {
          title: "Operators",
          path: "/docs/reference/operators",
          children: [
            {
              title: "Scalar",
              path: "/docs/reference/operators/scalar",
              children: reference.operators.scalar.map((op) => ({
                title: op.name,
                path: `/docs/reference/operators/scalar#${op.name}`,
              })),
            },
            {
              title: "Tabular",
              path: "/docs/reference/operators/tabular",
              children: reference.operators.tabular.map((op) => ({
                title: op.name,
                path: `/docs/reference/operators/tabular#${op.name}`,
              })),
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <div className="fixed top-0 left-0 z-10 flex h-full flex-col bg-white dark:bg-black">
        <DocsSidebar navItems={navItems} />
      </div>
      <main className="w-full flex-1 p-2 md:p-6">
        <div className="prose w-full max-w-none pl-64">{children}</div>
      </main>
    </div>
  );
}

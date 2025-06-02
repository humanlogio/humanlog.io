import { DocsSidebar } from "@/components/docs/reference/Sidebars";
import { ReactNode } from "react";
import { NavItem } from "@/lib/contents";
import { reference } from "@/lib/utils/reference";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const navItems: NavItem[] = [
    {
      title: "Get Started",
      path: "/docs/get-started",
      children: [
        { title: "Introduction", path: "/docs/get-started/introduction" },
        { title: "Installation", path: "/docs/get-started/installation" },
        { title: "Basic Usage", path: "/docs/get-started/basic-usage" },
      ],
    },
    {
      title: "Concepts",
      path: "/docs/concepts",
      children: [
        { title: "Overview", path: "/docs/concepts" },
        { title: "Logging", path: "/docs/concepts/logging" },
        { title: "Tracing", path: "/docs/concepts/tracing" },
        { title: "Localhost", path: "/docs/concepts/localhost" },
      ],
    },
    {
      title: "Features",
      path: "/docs/features",
      children: [
        { title: "CLI", path: "/docs/features/cli" },
        { title: "Query", path: "/docs/features/query" },
        { title: "Stream", path: "/docs/features/stream" },
        { title: "Sharing", path: "/docs/features/sharing" },
        { title: "Themes", path: "/docs/features/themes" },
      ],
    },
    {
      title: "Integrations",
      path: "/docs/integrations",
      children: [
        { title: "Overview", path: "/docs/integrations" },
        { title: "OpenTelemetry", path: "/docs/integrations/opentelemetry" },
        {
          title: "Structured Logging",
          path: "/docs/integrations/structured-logging",
        },
      ],
    },
    {
      title: "Reference",
      path: "/docs/reference",
      children: [
        {
          title: "Overview",
          path: "/docs/reference",
        },
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
    {
      title: "Dev only",
      path: "/docs/dev-only",
      devOnly: true,
      children: [
        {
          title: "Alerts Example",
          path: "/docs/dev-only/alerts-example",
          devOnly: true,
        },
        {
          title: "Mermaid Diagrams",
          path: "/docs/dev-only/mermaid-example",
          devOnly: true,
        },
        {
          title: "Test Code",
          path: "/docs/dev-only/test-code",
          devOnly: true,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar - fixed on desktop, uses Sheet on mobile */}
      <div className="fixed top-0 left-0 z-10 flex h-full flex-col bg-white dark:bg-black">
        <DocsSidebar navItems={navItems} />
      </div>

      {/* Main content area with proper padding based on screen size */}
      <main className="w-full flex-1 p-4 pt-16 md:p-6 md:pt-6">
        <div className="prose w-full max-w-none md:pl-64">{children}</div>
      </main>
    </div>
  );
}

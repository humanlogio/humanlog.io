import { DocsSidebar } from "@/components/docs/Sidebars";
import { ReactNode } from "react";
import path from "path";

import { scanDirectory } from "@/lib/contents";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const docsDir = path.join(process.cwd(), `src/app/docs`);
  return (
    <div className="flex min-h-screen">
      <DocsSidebar navItems={scanDirectory(docsDir, "/docs")} />
      <main className="flex-1 p-6">
        <div className="prose dark:prose-invert max-w-none">{children}</div>
      </main>
    </div>
  );
}

import { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 px-1 py-6">
        <div className="prose dark:prose-invert max-w-none">{children}</div>
      </main>
    </div>
  );
}

import { DocsSidebar } from "@/components/docs/Sidebars";
import { groupDocsBySection } from "@/lib/docs";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsList = groupDocsBySection();

  return (
    <div className="flex min-h-screen">
      <DocsSidebar docsList={docsList} />
      <main className="flex-1 p-6">
        <div className="prose max-w-none dark:prose-invert">{children}</div>
      </main>
    </div>
  );
}

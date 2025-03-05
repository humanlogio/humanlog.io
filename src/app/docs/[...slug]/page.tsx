import { MDXContent } from "@/components/docs/MdxContent";
import { getDocBySlug } from "@/lib/docs";
import { allDocs } from "contentlayer/generated";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return allDocs.map((doc) => ({
    slug: doc._raw.flattenedPath.split("/"),
  }));
}

export default function DocsPage({ params }: any) {
  const doc = getDocBySlug(params.slug);
  if (!doc) {
    return notFound();
  }

  return (
    <>
      {doc.description && (
        <p className="text-muted-foreground">{doc.description}</p>
      )}
      <MDXContent code={doc.body.code} />
    </>
  );
}

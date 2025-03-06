import { MDXContent } from "@/components/docs/MdxContent";
import { getDocBySlug } from "@/lib/docs";
import { allDocs } from "contentlayer/generated";
import { notFound } from "next/navigation";
import config from "@/features/config";

export async function generateStaticParams() {
  const isProd = config.NEXT_PUBLIC_SIGNUP_ONLY;
  const docs = allDocs.filter((doc) => !isProd || doc.published);

  return docs.map((doc) => ({
    slug: doc._raw.flattenedPath.split("/"),
  }));
}

export default async function DocsPage({ params }: any) {
  const resolvledParmas = await params;
  const doc = getDocBySlug(resolvledParmas.slug);
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

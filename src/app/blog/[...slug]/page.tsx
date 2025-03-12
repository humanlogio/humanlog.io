import { MDXContent } from "@/components/docs/MdxContent";
import { allBlogs } from "contentlayer/generated";
import { notFound } from "next/navigation";
import config from "@/features/config";

export async function generateStaticParams() {
  const blogs = allBlogs.filter((post) => post.published);

  return blogs.map((post) => ({
    slug: post._raw.flattenedPath.split("/"),
  }));
}

export default async function BlogPage({ params }: any) {
  const resolvledParmas = await params;
  const slugPath = `${resolvledParmas.slug[0]}/page`;
  const post = allBlogs.find((post) => slugPath === post.slugAsParams);
  if (!post) {
    return notFound();
  }

  return (
    <div className="container py-5">
      <div className="prose max-w-none dark:prose-invert">
        {post.description && (
          <p className="text-muted-foreground">{post.description}</p>
        )}
        <MDXContent code={post.body.code} />
      </div>
    </div>
  );
}

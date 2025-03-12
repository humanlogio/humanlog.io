import { allBlogs } from "contentlayer/generated";
import config from "@/features/config";
import Link from "next/link";

export default function BlogListPage() {
  const isProd = config.NEXT_IS_PROD;

  const posts = allBlogs
    .filter((post) => !isProd || post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container py-5">
      <h1 className="text-2xl font-bold">the humanlog blog</h1>
      <div className="mt-10 flex flex-col gap-2">
        {posts.map((post) => (
          <Link href={post.slug} key={post.slug} className="hover:underline">
            {post.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

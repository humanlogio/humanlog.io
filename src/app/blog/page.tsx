import fs from "fs";
import path from "path";
import Link from "next/link";
import { scanDirectory } from "@/lib/contents";

export interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

export default function BlogListPage() {
  const blogDir = path.join(process.cwd(), "src/app/blog");

  return (
    <div className="container py-5">
      <h1 className="text-2xl font-bold">the humanlog blog</h1>
      <div className="mt-10 flex flex-col gap-2">
        {scanDirectory(blogDir, "/blog").map((post) => (
          <Link href={post.path} key={post.path} className="hover:underline">
            {post.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

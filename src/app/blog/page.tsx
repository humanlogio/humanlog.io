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
  // const blogDir = path.join(process.cwd(), "src/app/blog");
  const BLOG_LIST = [
    {
      title: "Debugging K8s Audit Logs",
      path: "/blog/debugging-k8s-audit-logs",
    },
    {
      title: "Logs for Humans, Logs for Machines",
      path: "/blog/logs-for-humans-logs-for-machines",
    },
    {
      title: "TTL Caching Without TTL Support",
      path: "/blog/ttl-caching-without-ttl-support",
    },
  ];

  return (
    <div className="container py-5">
      <h1 className="text-2xl font-bold">the humanlog blog</h1>
      <div className="mt-10 flex flex-col gap-2">
        {BLOG_LIST.map((post) => (
          <Link href={post.path} key={post.path} className="hover:underline">
            {post.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

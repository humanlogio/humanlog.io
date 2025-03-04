import Link from "next/link";

const blogList = [
  {
    title: "Logs for humans, logs for machines",
    href: "/logs-for-humans-logs-for-machines",
  },
  {
    title: "How to get TTL keys with any cache",
    href: "/ttl-caching-without-ttl-support",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-4">
      {blogList.map((list) => {
        return (
          <Link key={list.href} href={`/blog/${list.href}`} className="text-md">
            {list.title}
          </Link>
        );
      })}
    </div>
  );
}

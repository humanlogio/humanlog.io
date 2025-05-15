"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  router.push("https://github.com/humanlogio/humanlog/stargazers");
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Localhost() {
  const router = useRouter();
  useEffect(() => {
    router.push("/localhost/query");
  }, []);
}

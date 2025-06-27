"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import structuredLogger from "@/lib/logger";

export default function Localhost() {
  const router = useRouter();
  useEffect(() => {
    structuredLogger.info("Localhost page accessed successfully", {
      component: "LocalhostPage",
      category: "component_lifecycle",
      action: "page_load",
    });

    router.push("/localhost/query");
  }, []);
}

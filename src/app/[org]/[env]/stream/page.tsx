"use client";

import LogInterface from "@/components/log-interface";
import { usePageStore } from "@/stores/page-store";
import { useEffect } from "react";

export default function Stream() {
  const { activePage, setActivePage } = usePageStore();

  useEffect(() => {
    setActivePage("stream");
  }, [activePage]);

  return (
    <div className="h-full w-full">
      <LogInterface nav="stream" />
    </div>
  );
}

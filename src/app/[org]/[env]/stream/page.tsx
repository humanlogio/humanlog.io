"use client";

import LogInterface from "@/components/log-interface";
import { usePage } from "@/stores/page-store";
import { useEffect } from "react";

export default function Stream() {
  const { activePage, setActivePage } = usePage();

  useEffect(() => {
    setActivePage("stream");
  }, [activePage]);

  return <LogInterface nav="stream" />;
}

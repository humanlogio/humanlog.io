"use client";

import { usePage } from "@/stores/page-store";
import { useEffect } from "react";

export default function Monitors() {
  const { activePage, setActivePage } = usePage();

  useEffect(() => {
    setActivePage("monitors");
  }, [activePage]);

  return <div>Monitors page</div>;
}

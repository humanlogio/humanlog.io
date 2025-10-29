"use client";

import { usePageStore } from "@/stores/page-store";
import { useEffect } from "react";

export default function Monitors() {
  const { activePage, setActivePage } = usePageStore();

  return <div>Monitors page</div>;
}

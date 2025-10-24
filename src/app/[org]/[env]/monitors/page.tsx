"use client";

import { usePage } from "@/stores/page-store";
import { useEffect } from "react";

export default function Monitors() {
  const { activePage, setActivePage } = usePage();

  return <div>Monitors page</div>;
}

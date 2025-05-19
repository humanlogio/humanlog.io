"use client";

import LogInterface from "@/components/log-interface";
import { DemoData } from "./components/demo-data";

export default function Query() {
  return (
    <>
      <DemoData />
      <LogInterface nav="query" />
    </>
  );
}

"use client";

import { SharedQuery } from "@/components/share";
import { useParams } from "next/navigation";

export default function ShareWithPrefix() {
  const params = useParams();
  const sharedId = params.id?.toString() ?? "";
  const prefix = params.prefix?.toString();

  return <SharedQuery sharedId={sharedId} prefix={prefix} />;
}

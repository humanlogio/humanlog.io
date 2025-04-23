"use client";

import { SharedQuery } from "@/components/share";

import { useParams } from "next/navigation";

export default function ShareWithId() {
  const params = useParams();
  const sharedId = params.id?.toString() ?? "";

  return <SharedQuery sharedId={sharedId} />;
}

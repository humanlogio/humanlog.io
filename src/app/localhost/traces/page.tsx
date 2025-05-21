"use client";

import { Traces } from "@/components/traces";
import { MessageCircleWarning } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function TracesPage() {
  const searchParams = useSearchParams();
  const traceId = searchParams.get("traceId");

  // fake data
  // const traceId = "8f641c20-f416-45da-b25f-c35f9a116826";
  const spanId = searchParams.get("spanId");

  if (!traceId) {
    return (
      <div className="flex min-h-[calc(100vh-275px)] w-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <MessageCircleWarning size={20} />
          <h4 className="font-bold">No Trace ID provided</h4>
        </div>
      </div>
    );
  }

  return <Traces traceId={traceId} spanId={spanId} />;
}

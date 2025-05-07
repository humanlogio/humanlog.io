import { Traces } from "@/components/traces";

export default async function TracesPage({
  params,
}: {
  params: Promise<{ traceid: string }>;
}) {
  const { traceid } = await params;
  return <Traces traceId={traceid} />;
}

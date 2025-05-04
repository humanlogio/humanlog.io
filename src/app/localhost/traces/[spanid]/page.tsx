export default async function Traces({
  params,
}: {
  params: Promise<{ spanid: string }>;
}) {
  const spanId = decodeURIComponent((await params).spanid);

  return <div>{spanId}</div>;
}

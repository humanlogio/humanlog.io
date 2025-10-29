import { SharedQuery } from "@/components/share";
import { Metadata } from "next";
import { getSelfURL } from "@/lib/config/envs";
import {
  generateSharedQueryMetadata,
  getPrefixSharedResultData,
} from "@/lib/utils/share-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; prefix: string }>;
}): Promise<Metadata> {
  const { id, prefix } = await params;
  const selfBaseURL = getSelfURL();
  const url = `${selfBaseURL}/share/${prefix}/${id}`;

  return generateSharedQueryMetadata({
    id,
    prefix,
    url,
  });
}

export default async function ShareWithPrefix({
  params,
}: {
  params: Promise<{ id: string; prefix: string }>;
}) {
  const { id, prefix } = await params;
  const sharedData = await getPrefixSharedResultData(id, prefix);
  return <SharedQuery sharedId={id} prefix={prefix} />;
}

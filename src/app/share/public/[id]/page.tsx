import { SharedQuery } from "@/components/share";
import { Metadata } from "next";
import { getSelfURL } from "@/lib/envs";
import {
  generateSharedQueryMetadata,
  getPublicSharedResultData,
} from "@/lib/utils/shareMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const selfBaseURL = getSelfURL();
  const url = `${selfBaseURL}/share/public/${id}`;

  return generateSharedQueryMetadata({
    id,
    url,
  });
}

export default async function ShareWithId({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return <SharedQuery sharedId={id} />;
}

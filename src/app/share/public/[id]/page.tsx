import { SharedQuery } from "@/components/share";

import { Metadata } from "next";
import { getSelfURL } from "@/lib/envs";
import { createServerGrpcClient } from "@/lib/server-grpc";
import { unstable_cache } from "next/cache";
import { gravatarURL } from "@/lib/utils/avatar";

const getSharedResultData = unstable_cache(
  async (shareId: string) => {
    const { publicShareClient } = createServerGrpcClient();
    try {
      return await publicShareClient.viewSharedResult({ shareId });
    } catch (error) {
      console.error("Error fetching shared result:", error);
      return null;
    }
  },
  ["shared-result"],
  { revalidate: 60 },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const selfBaseURL = getSelfURL();

  try {
    const response = await getSharedResultData(id);
    console.log("⭐️⭐️⭐️⭐️response⭐️⭐️⭐️⭐️", response);

    const sharedBy = response?.sharedBy;
    const queryText = response?.sharedResult?.query?.rawQuery || "Shared Query";
    const truncatedQuery =
      queryText.length > 160 ? queryText.substring(0, 157) + "..." : queryText;

    return {
      title: `Shared Query by ${sharedBy?.username} | HumanLog`,
      description: truncatedQuery,
      keywords: [
        "opentelemetry",
        "siem",
        "monitoring",
        "observability",
        "telemetry",
        "metrics",
        "metric",
        "tracing",
      ],

      openGraph: {
        title: `Shared Query by ${sharedBy?.username}`,
        description: truncatedQuery,
        type: "website",
        url: `${selfBaseURL}/share/public/${id}`,
        siteName: "HumanLog",
        images: [
          {
            url: `${gravatarURL(sharedBy?.email)}`,
            width: 1200,
            height: 630,
            alt: "HumanLog Shared Query",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: `Shared Query by ${sharedBy?.username} | HumanLog`,
        description: truncatedQuery,
        images: [`${gravatarURL(sharedBy?.email)}`],
        creator: "@humanlog",
      },

      alternates: {
        canonical: `${selfBaseURL}/share/public/${id}`,
        languages: {
          "en-US": `${selfBaseURL}/share/public/${id}`,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    return {
      title: "Shared Query | HumanLog",
      description: "View and interact with a shared log query",
      keywords: ["query", "logs", "database", "share", "humanlog", "analytics"],

      openGraph: {
        title: "Shared Query | HumanLog",
        description: "View and interact with a shared log query",
        type: "website",
        url: `${selfBaseURL}/share/public/${id}`,
        siteName: "HumanLog",
        images: [
          {
            url: ``,
            width: 1200,
            height: 630,
            alt: "HumanLog Shared Query",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: "Shared Query | HumanLog",
        description: "View and interact with a shared log query",
        images: [`${selfBaseURL}/images/default-og.png`],
        creator: "@humanlog",
      },

      alternates: {
        canonical: `${selfBaseURL}/share/public/${id}`,
        languages: {
          "en-US": `${selfBaseURL}/share/public/${id}`,
        },
      },
    };
  }
}

export default async function ShareWithId({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return <SharedQuery sharedId={id} />;
}

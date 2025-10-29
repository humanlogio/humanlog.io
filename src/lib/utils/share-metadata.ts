import { Metadata } from "next";
import { getSelfURL } from "@/lib/config/envs";
import { createServerGrpcClient } from "@/lib/utils/server-grpc";
import { unstable_cache } from "next/cache";

export const getPublicSharedResultData = unstable_cache(
  async (shareId: string) => {
    const { publicShareClient } = createServerGrpcClient();
    try {
      return await publicShareClient.viewSharedResult({ shareId });
    } catch (error) {
      console.error("Error fetching shared result:", error);
    }
  },
  ["shared-result"],
  { revalidate: 60 },
);

export const getPrefixSharedResultData = unstable_cache(
  async (shareId: string, prefix: string) => {
    const { publicShareClient } = createServerGrpcClient();
    try {
      return await publicShareClient.viewSharedResult({
        shareId,
        randomPrefix: prefix,
      });
    } catch (error) {
      console.error("Error fetching shared result with prefix:", error);
    }
  },
  ["shared-result-with-prefix"],
  { revalidate: 60 },
);

export async function generateSharedQueryMetadata({
  id,
  prefix,
  url,
}: {
  id: string;
  prefix?: string;
  url: string;
}): Promise<Metadata> {
  const selfURL = getSelfURL();

  const ogImageUrl = prefix
    ? `${selfURL}/api/og-image?id=${id}&prefix=${prefix}`
    : `${selfURL}/api/og-image?id=${id}`;

  try {
    const response = prefix
      ? await getPrefixSharedResultData(id, prefix)
      : await getPublicSharedResultData(id);

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
        url: url,
        siteName: "HumanLog",
        images: [
          {
            url: ogImageUrl,
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
        images: [ogImageUrl],
      },

      alternates: {
        canonical: url,
        languages: {
          "en-US": url,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    return {
      title: "Shared Query | HumanLog",
      description: "View and interact with a shared log query",
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
        title: "Shared Query | HumanLog",
        description: "View and interact with a shared log query",
        type: "website",
        url: `${selfURL}/share/public/${id}`,
        siteName: "HumanLog",
        images: [
          {
            url: ogImageUrl,
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
        images: [ogImageUrl],
      },
    };
  }
}

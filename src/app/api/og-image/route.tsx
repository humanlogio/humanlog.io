import { NextRequest } from "next/server";
import { createServerGrpcClient } from "@/lib/server-grpc";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const prefix = searchParams.get("prefix");

  if (!id) {
    return new Response("Missing id parameter", { status: 400 });
  }

  try {
    const { publicShareClient } = createServerGrpcClient();
    const response = await publicShareClient.viewSharedResult({
      shareId: id,
      ...(prefix && { randomPrefix: prefix }),
    });

    if (!response || !response.sharedResult) {
      return new Response("Shared result not found", { status: 404 });
    }

    const { sharedBy, sharedResult } = response;
    const query = sharedResult.query;

    const queryText = query?.rawQuery || "Shared Query";
    const truncatedQuery =
      queryText.length > 200 ? queryText.substring(0, 97) + "..." : queryText;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            height: "100%",
            padding: "40px",
            background: "black",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>

            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
              Shared Query Result
            </h1>
          </div>

          <div style={{ display: "flex", fontSize: "14px", color: "white" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Shared by: {sharedBy?.username || "Anonymous"}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid white",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "5px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <div style={{ fontSize: "18px" }}>Query</div>
            </div>
            <div
              style={{
                display: "flex",
                border: "1px solid white",
                padding: "16px",
                borderRadius: "8px",

                marginBottom: "16px",
                flex: 1,
                maxHeight: "30%",
                overflow: "hidden",
              }}
            >
              <code
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  color: "white",
                }}
              >
                {truncatedQuery}
              </code>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "18px" }}>Result</div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "8px" }}
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "50%",
                  border: "1px solid white",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    textAlign: "center",
                  }}
                >
                  View complete query results by opening the shared link
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              marginTop: "20px",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              humanlog.io
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}

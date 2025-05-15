// Minimal Next.js App Router API route for GitHub stars with in-memory cache
import { NextRequest } from "next/server";

let cachedStars: string | null = null;
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(req: NextRequest) {
  const now = Date.now();
  if (cachedStars && now - lastFetch < CACHE_DURATION) {
    return Response.json({ stars: cachedStars });
  }
  try {
    const response = await fetch(
      "https://api.github.com/repos/humanlogio/humanlog",
    );
    const data = await response.json();
    let stars = "0";
    if (data.stargazers_count) {
      stars =
        data.stargazers_count >= 1000
          ? `${(data.stargazers_count / 1000).toFixed(1)}k`
          : data.stargazers_count.toString();
    }
    cachedStars = stars;
    lastFetch = now;
    return Response.json({ stars });
  } catch {
    return Response.json({ stars: cachedStars || "0" }, { status: 200 });
  }
}

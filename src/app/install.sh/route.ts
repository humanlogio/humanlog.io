import { unstable_noStore as noStore } from "next/cache";
import { renderInstallScript } from "@/lib/install_script";

export async function GET(request: Request) {
  noStore();
  const project = "humanlog";

  const apiBaseURL = URL.parse(process.env.NEXT_PUBLIC_API_BASE_URL!)!;
  const reqURL = URL.parse(request.url)!;
  const logPrefix = reqURL.host + reqURL.pathname;
  const installScript = renderInstallScript(project, logPrefix, apiBaseURL);
  return new Response(installScript);
}

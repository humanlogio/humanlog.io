import { unstable_noStore as noStore } from "next/cache";
import { renderInstallScript } from "@/lib/install_script";

export async function GET(request: Request) {
  noStore();
  const project = "humanlog";
  const installPath = "/install.sh";
  const apiBaseURL = URL.parse(process.env.NEXT_PUBLIC_API_BASE_URL!)!;
  const selfBaseURL = URL.parse(process.env.NEXT_PUBLIC_SELF_BASE_URL!)!;
  const installScript = renderInstallScript(
    project,
    installPath,
    apiBaseURL,
    selfBaseURL,
  );
  return new Response(installScript);
}

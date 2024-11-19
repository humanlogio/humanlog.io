import { renderInstallScript } from "@/lib/install_script";
import { getAPIURL, getSelfURL, getReleaseChannel } from "@/lib/envs";

export async function GET(request: Request) {
  const project = "humanlog";

  const apiBaseURL = URL.parse(getAPIURL())!;
  const selfBaseURL = URL.parse(getSelfURL())!;
  const reqURL = URL.parse(request.url)!;
  const logPrefix = selfBaseURL.host + reqURL.pathname;
  const installScript = renderInstallScript(
    project,
    logPrefix,
    apiBaseURL,
    getReleaseChannel(),
    true,
  );
  return new Response(installScript);
}

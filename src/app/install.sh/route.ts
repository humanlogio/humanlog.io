import { renderInstallScript } from "@/lib/utils/install_script";
import { getAPIURL, getSelfURL, getReleaseChannel } from "@/lib/config/envs";

export async function GET(request: Request) {
  const project = "humanlog";

  const apiBaseURL = URL.parse(getAPIURL())!;
  const selfBaseURL = URL.parse(getSelfURL())!;
  const reqURL = URL.parse(request.url)!;

  const logPrefix = selfBaseURL.host + reqURL.pathname;
  const installScript = renderInstallScript(
    project,
    logPrefix,
    selfBaseURL,
    apiBaseURL,
    getReleaseChannel(),
    true,
  );
  return new Response(installScript);
}

import { renderInstallScript } from "@/lib/install_script";
import { getAPIURL, getSelfURL, getReleaseChannel } from "@/lib/envs";

export async function GET(request: Request) {
  const project = "apictl";

  const apiBaseURL = URL.parse(getAPIURL())!;
  const selfBaseURL = URL.parse(getSelfURL())!;
  const logPrefix = selfBaseURL.host + selfBaseURL.pathname;
  const installScript = renderInstallScript(
    project,
    logPrefix,
    apiBaseURL,
    getReleaseChannel(),
  );
  return new Response(installScript);
}

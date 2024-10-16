import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: Request) {
  noStore();

  const apiBaseURL = URL.parse(process.env.NEXT_PUBLIC_API_BASE_URL!)!;
  const releaseApiURL = URL.parse("/api/releases/humanlog", apiBaseURL!);

  const selfBaseURL = URL.parse(process.env.NEXT_PUBLIC_SELF_BASE_URL!)!;
  const logPrefix =
    (selfBaseURL.port
      ? selfBaseURL.hostname + ":" + selfBaseURL.port
      : selfBaseURL.hostname) + "/install.sh";

  const installScript = `#!/bin/sh
# Based on Deno installer: Copyright 2019 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

if [ -n "\$HUMANLOG_DEBUG" ]; then
	PS4='[$(basename \${BASH_SOURCE[0]:-inherited}):\${LINENO}:\${FUNCNAME[0]:-main}] '
	set -x
fi

os=$(uname -s)
arch=$(uname -m)
channel="\${HUMANLOG_CHANNEL:-main}"

function loginfo() {
	LIGHTGREEN='\\033[1;32m'
	NC='\\033[0m'
	echo "\${LIGHTGREEN}${logPrefix}\${NC}: \$@"
}

function logerror() {
	LIGHTRED='\\033[1;31m'
	NC='\\033[0m'
	echo "\${LIGHTRED}${logPrefix}\${NC}: \$@"
}

loginfo "looking up latest release from \${channel} channel for \${os} on \${arch}"
curl --silent --show-error --fail-with-body --data "{\\"os\\":\\"\${os}\\",\\"arch\\":\\"\${arch}\\",\\"channel\\":\\"\${channel}\\"}" ${releaseApiURL} > /tmp/humanlog_uri 2> /tmp/curl_error || { logerror "$(cat /tmp/humanlog_uri) \($(cat /tmp/curl_error)\)" ; exit 1; }

humanlog_uri=$(cat /tmp/humanlog_uri)
if [ ! "$humanlog_uri" ]; then
	logerror "unable to find an humanlog release for $os/$arch - see github.com/humanlogio/humanlog/releases for all versions" 1>&2
	exit 1
fi
loginfo "installing latest release from $humanlog_uri"

set -e

humanlog_install="\${HUMANLOG_INSTALL:-$HOME/.humanlog}"

bin_dir="$humanlog_install/bin"
exe="$bin_dir/humanlog"

if [ ! -d "$bin_dir" ]; then
 	mkdir -p "$bin_dir"
fi

curl -q --fail --show-error --location --progress-bar --output "$exe.tar.gz" "$humanlog_uri"
cd "$bin_dir"
tar xzf "$exe.tar.gz"
chmod +x "$exe"
rm "$exe.tar.gz"

loginfo "humanlog was installed successfully to $exe"
if command -v humanlog >/dev/null; then
	loginfo "Run 'humanlog --help' to get started"
else
	case $SHELL in
	/bin/zsh) shell_profile=".zshrc" ;;
	*) shell_profile=".bash_profile" ;;
	esac
	loginfo "Manually add the directory to your \$HOME/$shell_profile (or similar)"
	loginfo "  export HUMANLOG_INSTALL=\"$humanlog_install\""
	loginfo "  export PATH=\"\$HUMANLOG_INSTALL/bin:\$PATH\""
	loginfo "Run '$exe --help' to get started"
fi
`;

  return new Response(installScript);
}

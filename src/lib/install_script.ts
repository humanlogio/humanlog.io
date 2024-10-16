export const renderInstallScript = (
  project: string,
  installPath: string,
  apiBaseURL: URL,
  selfBaseURL: URL,
): string => {
  const releaseApiURL = URL.parse(`/api/releases/${project}`, apiBaseURL!);

  const logPrefix =
    (selfBaseURL.port
      ? selfBaseURL.hostname + ":" + selfBaseURL.port
      : selfBaseURL.hostname) + installPath;

  return `#!/bin/sh
# Based on Deno installer: Copyright 2019 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

if [ -n "\$HUMANLOG_DEBUG" ]; then
	PS4='[$(basename \${BASH_SOURCE[0]:-inherited}):\${LINENO}:\${FUNCNAME[0]:-main}] '
	set -x
fi

os=$(uname -s)
arch=$(uname -m)
channel="\${HUMANLOG_CHANNEL:-main}"
project="${project}"

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

function check_file_has_content() {
	local filename=\${1}
	local content=\${2}
	grep <\${filename} "\${content}" > /dev/null
}

function append_content_to_file() {
	local filename=\${1}
	local content=\${2}
	echo \${content} >> \${filename}
}

url_file=/tmp/project_uri

loginfo "looking up latest release from \${channel} channel for \${os} on \${arch}"
curl --silent --show-error --fail-with-body --data "{\\"os\\":\\"\${os}\\",\\"arch\\":\\"\${arch}\\",\\"channel\\":\\"\${channel}\\"}" ${releaseApiURL} > \${url_file} 2> /tmp/curl_error || { logerror "$(cat \${url_file}) \($(cat /tmp/curl_error)\)" ; exit 1; }

project_uri=$(cat \${url_file})
if [ ! "\${project_uri}" ]; then
	logerror "unable to find an \${project} release for \${os}/\${arch} - see github.com/humanlogio/\${project}/releases for all versions" 1>&2
	exit 1
fi
loginfo "installing latest release from \${project_uri}"

set -e

project_install="\${HUMANLOG_INSTALL:-$HOME/.humanlog}"

bin_dir="\${project_install}/bin"
exe="\${bin_dir}/\${project}"

if [ ! -d "\${bin_dir}" ]; then
 	mkdir -p "\${bin_dir}"
fi

curl -q --fail --show-error --location --progress-bar --output "\${exe}.tar.gz" "\${project_uri}"
cd "\${bin_dir}"
tar xzf "\${exe}.tar.gz"
chmod +x "\${exe}"
rm "\${exe}.tar.gz"

loginfo "\${project} was successfully installed to \${exe}"
if command -v \${project} >/dev/null; then
	loginfo "Run '\${project} --help' to get started"
else
	shell=$(basename \${SHELL})
	if [ "\$\{shell}" == "fish" ]; then
		shell_profile=".config/fish/config.fish"
		if ! check_file_has_content "\${HOME}/\${shell_profile}" "fish_add_path \"\${project_install}/bin\""; then
			append_content_to_file "\${HOME}/\${shell_profile}" "fish_add_path \"\${project_install}/bin\""
			loginfo "\${project_install}/bin was added to your \\\$PATH (via '"\${shell_profile}\"')"
			cat <<EOF

	Run \\\`source \${shell_profile}\\\` to update your \\\$PATH right away.
EOF
		fi
		cat <<EOF

	Run \\\`\${project} --help\\\` to get started

EOF
	fi

	if [ "\$\{shell}" == "zsh" ]; then
		shell_profile=".zshrc"
		cat <<EOF

	Manually add the directory to your \$HOME/\${shell_profile} (or similar)

		export HUMANLOG_INSTALL=\"\${project_install}\"
		export PATH=\"\\\$HUMANLOG_INSTALL/bin:\\\$PATH\"

	Run '\${exe} --help' to get started

EOF
	fi

	if [ "\$\{shell}" == "bash" ]; then
		shell_profile=".bash_profile"
		cat <<EOF

	Manually add the directory to your \$HOME/\${shell_profile} (or similar)

		export HUMANLOG_INSTALL=\"\${project_install}\"
		export PATH=\"\\\$HUMANLOG_INSTALL/bin:\\\$PATH\"

	Run '\${exe} --help' to get started

EOF
	fi
fi
`;
};

export const renderInstallScript = (
  project: string,
  logPrefix: string,
  apiBaseURL: URL,
  channel: string,
  hasOnboarding: boolean,
): string => {
  const releaseApiURL = URL.parse(`/api/releases/${project}`, apiBaseURL!);

  let onboardingBlock = "";
  if (hasOnboarding) {
    onboardingBlock = `
if [[ -z "\${NONINTERACTIVE-}" ]]; then
	\${exe} onboarding
fi`;
  }

  return `#!/bin/bash
# TODO(everyone): Keep this script simple and easily auditable.

# inspired by the Deno installer
# inspired by the Homebrew installer

if [ -n "\$HUMANLOG_DEBUG" ]; then
	PS4='[$(basename \${BASH_SOURCE[0]:-inherited}):\${LINENO}:\${FUNCNAME[0]:-main}] '
	set -x
fi

abort() {
  printf "%s\n" "$@" >&2
  exit 1
}

# Fail fast with a concise message when not using bash
# Single brackets are needed here for POSIX compatibility
# shellcheck disable=SC2292
if [ -z "\${BASH_VERSION:-}" ]
then
  abort "Bash is required to interpret this script."
fi

# Check if script is run in POSIX mode
if [[ -n "\${POSIXLY_CORRECT+1}" ]]
then
  abort 'Bash must not run in POSIX mode. Please unset POSIXLY_CORRECT and try again.'
fi

# Check if script is run with force-interactive mode in CI
if [[ -n "\${CI-}" && -n "\${INTERACTIVE-}" ]]
then
  abort "Cannot run force-interactive mode in CI."
fi

if [[ -n "\${INTERACTIVE-}" && -n "\${NONINTERACTIVE-}" ]]
then
  abort 'Both "INTERACTIVE" and "NONINTERACTIVE" are set. Please unset at least one variable and try again.'
fi

# string formatters
if [[ -t 1 ]]
then
  tty_escape() { printf "\\033[%sm" "$1"; }
else
  tty_escape() { :; }
fi
tty_mkbold() { tty_escape "1;$1"; }
tty_lightgreen="$(tty_mkbold 32)"
tty_lightred="$(tty_mkbold 31)"
tty_reset="$(tty_escape 0)"

function loginfo() {
	echo "\${tty_lightgreen}${logPrefix}\${tty_reset}: \$@"
}

function logerror() {
	echo "\${tty_lightred}${logPrefix}\${tty_reset}: \$@"
}

# shellcheck disable=SC2016
if [[ -z "\${NONINTERACTIVE-}" ]]
then
  if [[ -n "\${CI-}" ]]
  then
    logerror 'Running in non-interactive mode because "CI" is set.'
    NONINTERACTIVE=1
  elif [[ ! -t 0 ]]
  then
    if [[ ! -z "\${INTERACTIVE-}" ]]
    then
      logerror 'Running in interactive mode despite "stdin" not being a TTY because "INTERACTIVE" is set.'
    fi
  fi
else
  loginfo 'Running in non-interactive mode because "NONINTERACTIVE" is set.'
fi

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

os=$(uname -s)
arch=$(uname -m)
channel="\${HUMANLOG_CHANNEL:-${channel}}"
project="${project}"

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
${onboardingBlock}

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

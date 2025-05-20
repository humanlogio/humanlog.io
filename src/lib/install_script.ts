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

function add_path_bash() {
	local path="$1"
	local profile="\${HOME}/.bash_profile"
	local line="export PATH=\"\${path}:\$PATH\""

	if ! check_file_has_content "\${profile}" "\${line}"; then
		append_content_to_file "\${profile}" "\${line}"
		loginfo "\${path} was added to your \\\$PATH (via '\${profile}')"
		source \${profile}
		echo -e "\nRun \\\`source \${profile}\\\` to update your \\\$PATH right away."
	fi
}

function add_path_zsh() {
	local path="$1"
	local profile="\${HOME}/.zshrc"
	local line="export PATH=\"\${path}:\$PATH\""

	if ! check_file_has_content "\${profile}" "\${line}"; then
		append_content_to_file "\${profile}" "\${line}"
		loginfo "\${path} was added to your \\\$PATH (via '\${profile}')"
		echo -e "\nRun \\\`source \${profile}\\\` to update your \\\$PATH right away."
	fi
}

function add_path_fish() {
	local path="$1"
	local profile="\${HOME}/.config/fish/config.fish"
	local line="fish_add_path \"\${path}\""

	if ! check_file_has_content "\${profile}" "\${line}"; then
		append_content_to_file "\${profile}" "\${line}"
		loginfo "\${path} was added to your \\\$PATH (via '\${profile}')"
		echo -e "\nRun \\\`source \${profile}\\\` to update your \\\$PATH right away."
	fi
}

function add_path_to_shell() {
	local path="$1"
	local shell_name
	shell_name=$(basename "\${SHELL}")

	case "\${shell_name}" in
		bash)
			add_path_bash "\${path}"
			;;
		zsh)
			add_path_zsh "\${path}"
			;;
		fish)
			add_path_fish "\${path}"
			;;
		*)
			loginfo "Unrecognized shell: \${shell_name}. Please add \${path} to your PATH manually."
			;;
	esac
}

function is_usable_path_dir() {
	local dir="$1"

	if [ -d "\${dir}" ] && [ -w "\${dir}" ]; then
		case ":$PATH:" in
			*":\${dir}:"*)
				return 0
				;;
		esac
	fi

	return 1
}

function detect_user_install_dir() {
	local existing_path
	existing_path=$(command -v humanlog 2>/dev/null || true)

	# 0. Overwrite existing binary if it's writable
	if [ -n "\${existing_path}" ] && [ -f "\${existing_path}" ] && [ -w "\${existing_path}" ]; then
		dirname "\${existing_path}"
		return 0
	fi


	# 1. Use XDG_BIN_HOME if valid
	if [ -n "\${XDG_BIN_HOME}" ] && is_usable_path_dir "\${XDG_BIN_HOME}"; then
		printf "%s\n" "\${XDG_BIN_HOME}"
		return 0
	fi

	# 2. Use ~/.local/bin if valid
	local local_bin="\${HOME}/.local/bin"
	if is_usable_path_dir "\${local_bin}"; then
		printf "%s\n" "\${local_bin}"
		return 0
	fi

	# 3. Scan $PATH for first usable dir
	IFS=:
	for dir in $PATH; do
		if [ -d "\${dir}" ] && [ -w "\${dir}" ]; then
			printf "%s\n" "\${dir}"
			return 0
		fi
	done

	# 4. Fallback to ~/.local/bin even if not in $PATH or not yet created
	printf "%s\n" "\${local_bin}"
}

os=$(uname -s)
arch=$(uname -m)
channel="\${HUMANLOG_CHANNEL:-${channel}}"
project="${project}"

url_file=/tmp/project_uri

loginfo "looking up latest release from \${channel} channel for \${os} on \${arch}"
curl --silent --show-error --data "{\\"os\\":\\"\${os}\\",\\"arch\\":\\"\${arch}\\",\\"channel\\":\\"\${channel}\\"}" ${releaseApiURL} > \${url_file} 2> /tmp/curl_error || { logerror "$(cat \${url_file}) \($(cat /tmp/curl_error)\)" ; exit 1; }

project_uri=$(cat \${url_file})
if [ ! "\${project_uri}" ]; then
	logerror "unable to find an \${project} release for \${os}/\${arch} - see github.com/humanlogio/\${project}/releases for all versions" 1>&2
	exit 1
fi
loginfo "installing latest release from \${project_uri}"

set -e

project_install="\${HUMANLOG_INSTALL:-$(detect_user_install_dir)}"

exe="\${project_install}/\${project}"

if [ ! -d "\${project_install}" ]; then
 	mkdir -p "\${project_install}"
fi

curl -q --fail --show-error --location --progress-bar --output "\${exe}.tar.gz" "\${project_uri}"
cd "\${project_install}"
tar xzf "\${exe}.tar.gz"
chmod +x "\${exe}"
rm "\${exe}.tar.gz"
${onboardingBlock}

loginfo "\${project} was successfully installed to \${exe}"

if command -v "\${project}" >/dev/null; then
	loginfo "Run '\${project} --help' to get started"
else
	add_path_to_shell "\${project_install}"
fi
`;
};

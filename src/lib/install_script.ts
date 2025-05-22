const debugWithLocalproject = false;
const suggestDemo = false;

export const renderInstallScript = (
  project: string,
  logPrefix: string,
  selfBaseURL: URL,
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
  if (debugWithLocalproject) {
    onboardingBlock = `
if [[ -z "\${NONINTERACTIVE-}" ]]; then
	loginfo "🚀 hello humanlog dev, we will run your local checkout's onboarding command. enjoy!"
	loginfo "🚀 > go run -ldflags \\\"-X main.defaultBaseSiteAddr=${selfBaseURL}\\\" -tags pro ./cmd/humanlog onboarding"
	go run -ldflags "-X main.defaultBaseSiteAddr=${selfBaseURL}" -tags pro ./cmd/humanlog onboarding
fi`;
  }

  let demoBlock = "";
  if (suggestDemo) {
    demoBlock = `loginfo "\${project} is ready to go! take a look around with:\n\n\thumanlog demo\n"
`;
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
tty_lightcyan="$(tty_mkbold 36)"
tty_lightblue="$(tty_mkbold 34)"
tty_lightmagenta="$(tty_mkbold 35)"
tty_lightgreen="$(tty_mkbold 32)"
tty_lightred="$(tty_mkbold 31)"
tty_reset="$(tty_escape 0)"

function logdebug() {
	if [ -n "\${CI-}" ] || [ -n "\$HUMANLOG_DEBUG" ]; then
		echo "\${tty_lightcyan}${logPrefix}\${tty_reset}: \$@" >&2
	fi
}

function loginfo() {
	echo "\${tty_lightgreen}${logPrefix}\${tty_reset}: \$@" >&2
}

function logerror() {
	echo "\${tty_lightred}${logPrefix}\${tty_reset}: \$@" >&2
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

function lookup_project_release_url() {
	local project="$1"
	local os="$2"
	local arch="$3"
	local channel="$4"
	local url_file="/tmp/\${project}_release_url.$$"
	local error_file="/tmp/\${project}_curl_error.$$"

	loginfo "fetching latest version"
	logdebug "looking up latest release from \${channel} channel for \${os} on \${arch}"

	curl --silent --show-error \
		--data "{\\\"os\\\":\\\"\${os}\\\",\\\"arch\\\":\\\"\${arch}\\\",\\\"channel\\\":\\\"\${channel}\\\"}" \
		${releaseApiURL} \
		> "\${url_file}" \
		2> "\${error_file}" || {
			logerror "$(cat \${url_file}) ($(cat \${error_file}))"
			rm -f "\${url_file}" "\${error_file}"
			exit 1
		}

	local project_uri
	project_uri=$(cat "\${url_file}")
	rm -f "\${url_file}" "\${error_file}"

	if [ -z "\${project_uri}" ]; then
		logerror "unable to find a \${project} release for \${os}/\${arch} - see github.com/humanlogio/\${project}/releases for all versions"
		exit 1
	fi

	printf "%s" "\${project_uri}"
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

function add_path_bash() {
	local path="$1"
	local profile="\${HOME}/.bash_profile"
	local line="export PATH=\"\${path}:\$PATH\""

	if ! check_file_has_content "\${profile}" "\${line}"; then
		append_content_to_file "\${profile}" "\${line}"
		loginfo "\${path} was added to your \\\$PATH (via '\${profile}')"
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
			logerror "Unrecognized shell: \${shell_name}. Please add \${path} to your PATH manually."
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

function install_project_binary_atomically() {
	local install_dir="$1"
	local binary_name="$2"
	local tarball_url="$3"

	local tmp_root="\${TMPDIR:-/tmp}"
	local tmpdir="\${tmp_root}/humanlog-install.$$"
	local tarball="\${tmpdir}/\${binary_name}.tar.gz"
	local staged_binary="\${tmpdir}/\${binary_name}"
	local final_binary="\${install_dir}/\${binary_name}"

	mkdir -p "\${tmpdir}" || abort "Failed to create staging directory: \${tmpdir}"

	# Always clean up on exit or failure
	trap 'rm -rf "\${tmpdir}"' EXIT INT TERM

	curl -q --fail --show-error --location --progress-bar --output "\${tarball}" "\${tarball_url}" || abort "Download failed"
	tar -xzf "\${tarball}" -C "\${tmpdir}" || abort "Extraction failed"
	chmod +x "\${staged_binary}" || abort "Failed to make binary executable"

	# Ensure install dir exists
	if [ ! -d "\${install_dir}" ]; then
		mkdir -p "\${install_dir}" || abort "Failed to create install directory: \${install_dir}"
	fi

	mv "\${staged_binary}" "\${final_binary}" || abort "Failed to move binary into place"
}

os=$(uname -s)
arch=$(uname -m)
channel="\${HUMANLOG_CHANNEL:-${channel}}"
project="${project}"

project_uri=$(lookup_project_release_url "\${project}" "\${os}" "\${arch}" "\${channel}")
logdebug "installing latest release from \${project_uri}"

set -e

project_install="\${HUMANLOG_INSTALL:-$(detect_user_install_dir)}"

exe="\${project_install}/\${project}"

if [ ! -d "\${project_install}" ]; then
 	mkdir -p "\${project_install}"
fi

install_project_binary_atomically "\${project_install}" "\${project}" "\${project_uri}"

${onboardingBlock}


if command -v "\${project}" >/dev/null; then
	logdebug "\${project} was successfully installed to \${exe}"
else
	logdebug "\${project} was successfully installed to \${exe} but needs PATH integration"
	add_path_to_shell "\${project_install}"
fi

${demoBlock}

loginfo "send your OTEL data here:\n\n   export \${tty_lightcyan}OTEL_EXPORTER_OTLP_ENDPOINT\${tty_reset}=\${tty_lightcyan}http://localhost:4317\${tty_reset}\n"

loginfo "✨"
`;
};

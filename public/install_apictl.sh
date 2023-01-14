#!/bin/sh
# Based on Deno installer: Copyright 2019 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

set -eu

os=$(uname -s)
arch=$(uname -m)

apictl_uri=$(curl -s --data "{\"os\":\"${os}\",\"arch\":\"${arch}\"}" https://api.humanlog.io/api/releases/apictl)
if [ ! "$apictl_uri" ]; then
	echo "Error: Unable to find an apictl release for $os/$arch - see github.com/humanlogio/apictl/releases for all versions" 1>&2
	exit 1
fi

apictl_install="${HUMANLOG_INSTALL:-$HOME/.humanlog}"

bin_dir="$apictl_install/bin"
exe="$bin_dir/apictl"


if [ ! -d "$bin_dir" ]; then
 	mkdir -p "$bin_dir"
fi

curl -q --fail --location --progress-bar --output "$exe.tar.gz" "$apictl_uri"
cd "$bin_dir"
tar xzf "$exe.tar.gz"
chmod +x "$exe"
rm "$exe.tar.gz"

echo "apictl was installed successfully to $exe"
if command -v apictl >/dev/null; then
	echo "Run 'apictl --help' to get started"
else
	case $SHELL in
	/bin/zsh) shell_profile=".zshrc" ;;
	*) shell_profile=".bash_profile" ;;
	esac
	echo "Manually add the directory to your \$HOME/$shell_profile (or similar)"
	echo "  export HUMANLOG_INSTALL=\"$apictl_install\""
	echo "  export PATH=\"\$HUMANLOG_INSTALL/bin:\$PATH\""
	echo "Run '$exe --help' to get started"
fi

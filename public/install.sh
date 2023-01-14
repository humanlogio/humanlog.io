#!/bin/sh
# Based on Deno installer: Copyright 2019 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

set -eu

os=$(uname -s)
arch=$(uname -m)

humanlog_uri=$(curl -s --data "{\"os\":\"${os}\",\"arch\":\"${arch}\"}" https://api.humanlog.io/api/releases/humanlog)
if [ ! "$humanlog_uri" ]; then
	echo "Error: Unable to find an humanlog release for $os/$arch - see github.com/humanlogio/humanlog/releases for all versions" 1>&2
	exit 1
fi

humanlog_install="${HUMANLOG_INSTALL:-$HOME/.humanlog}"

bin_dir="$humanlog_install/bin"
exe="$bin_dir/humanlog"


if [ ! -d "$bin_dir" ]; then
 	mkdir -p "$bin_dir"
fi

curl -q --fail --location --progress-bar --output "$exe.tar.gz" "$humanlog_uri"
cd "$bin_dir"
tar xzf "$exe.tar.gz"
chmod +x "$exe"
rm "$exe.tar.gz"

echo "humanlog was installed successfully to $exe"
if command -v humanlog >/dev/null; then
	echo "Run 'humanlog --help' to get started"
else
	case $SHELL in
	/bin/zsh) shell_profile=".zshrc" ;;
	*) shell_profile=".bash_profile" ;;
	esac
	echo "Manually add the directory to your \$HOME/$shell_profile (or similar)"
	echo "  export HUMANLOG_INSTALL=\"$humanlog_install\""
	echo "  export PATH=\"\$HUMANLOG_INSTALL/bin:\$PATH\""
	echo "Run '$exe --help' to get started"
fi

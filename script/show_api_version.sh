#!/usr/bin/env bash

set -euo pipefail

root=$(git rev-parse --show-toplevel)

function main() {
    jq < package.json -r '.dependencies["api"] | split("#")[-1]'
}

main

#!/usr/bin/env bash

set -euo pipefail

root=$(git rev-parse --show-toplevel)

function main() {
    export SHA=${1}
    jq < ${root}/package.json > ${root}/package_next.json --arg commit ${SHA} '.dependencies["api"] = "github:humanlogio/api#\( $commit )"'
    mv ${root}/package_next.json ${root}/package.json
    npm ci
}

main ${1}

#!/usr/bin/env pwsh
# Copyright 2018 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

$ErrorActionPreference = 'Stop'

$Version = if ($v) {
  $v
} elseif ($args.Length -eq 1) {
  $args.Get(0)
} else {
  "latest"
}

$HumanlogInstall = $env:HUMANLOG_INSTALL
$BinDir = if ($HumanlogInstall) {
  "$HumanlogInstall\bin"
} else {
  "$Home\.humanlog\bin"
}

$HumanlogZip = "$BinDir\humanlog.zip"
$HumanlogExe = "$BinDir\humanlog.exe"

# Humanlog & GitHub require TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

try {
  $body = @{
    "os" = "windows"
    "arch" = "amd64"
  }
  $Response = Invoke-WebRequest "https://api.humanlog.io/api/releases/humanlog" -UseBasicParsing -Body ($body|ConvertTo-Json)
  $HumanlogUri = $Response.Content
}
catch {
  $StatusCode = $_.Exception.Response.StatusCode.value__
  if ($StatusCode -eq 404) {
    Write-Error "Unable to find a humanlog release on GitHub for version:$Version - see github.com/humanlogio/humanlog/releases for all versions"
  } else {
    $Request = $_.Exception
    Write-Error "Error while fetching releases: $Request"
  }
  Exit 1
}

if (!(Test-Path $BinDir)) {
  New-Item $BinDir -ItemType Directory | Out-Null
}

Invoke-WebRequest $HumanlogUri -OutFile $HumanlogZip -UseBasicParsing

if (Get-Command Expand-Archive -ErrorAction SilentlyContinue) {
  Expand-Archive $HumanlogZip -Destination $BinDir -Force
} else {
  Remove-Item $HumanlogExe -ErrorAction SilentlyContinue
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [IO.Compression.ZipFile]::ExtractToDirectory($HumanlogZip, $BinDir)
}

Remove-Item $HumanlogZip

$User = [EnvironmentVariableTarget]::User
$Path = [Environment]::GetEnvironmentVariable('Path', $User)
if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) {
  [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User)
  $Env:Path += ";$BinDir"
}

Write-Output "humanlog was installed successfully to $HumanlogExe"
Write-Output "Run 'humanlog --help' to get started"

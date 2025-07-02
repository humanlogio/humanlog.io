import { Version } from "api/js/types/v1/version_pb";

const semver = require("semver");

export const versionToString = (version: Version) => {
  let versionString = `${version.major}.${version.minor}.${version.patch}`;

  if (version.prereleases && version.prereleases.length > 0) {
    versionString += `-${version.prereleases.join(".")}`;
  }

  if (version.build) {
    versionString += `+${version.build}`;
  }

  return versionString;
};

export const versionCompare = (version1: Version, version2: Version) => {
  const v1 = versionToString(version1);
  const v2 = versionToString(version2);

  return semver.compare(v1, v2);
};

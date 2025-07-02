import { Version } from "api/js/types/v1/version_pb";

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
  // Safely get version numbers, defaulting to 0 if undefined
  const major1 = version1.major || 0;
  const major2 = version2.major || 0;
  const minor1 = version1.minor || 0;
  const minor2 = version2.minor || 0;
  const patch1 = version1.patch || 0;
  const patch2 = version2.patch || 0;

  // Compare major version
  if (major1 < major2) return -1;
  if (major1 > major2) return 1;

  // Major versions are equal, compare minor version
  if (minor1 < minor2) return -1;
  if (minor1 > minor2) return 1;

  // Major and minor versions are equal, compare patch version
  if (patch1 < patch2) return -1;
  if (patch1 > patch2) return 1;

  // Compare prereleases
  const hasPrerelease1 =
    version1.prereleases && version1.prereleases.length > 0;
  const hasPrerelease2 =
    version2.prereleases && version2.prereleases.length > 0;

  if (!hasPrerelease1 && hasPrerelease2) return 1; // 1.0.0 > 1.0.0-alpha
  if (hasPrerelease1 && !hasPrerelease2) return -1; // 1.0.0-alpha < 1.0.0

  // Both have prereleases or both don't have prereleases
  if (hasPrerelease1 && hasPrerelease2) {
    // Compare prerelease identifiers one by one
    const pre1 = version1.prereleases;
    const pre2 = version2.prereleases;
    const minLength = Math.min(pre1.length, pre2.length);

    for (let i = 0; i < minLength; i++) {
      const p1 = pre1[i];
      const p2 = pre2[i];

      // Check if identifiers are numeric
      const isNum1 = /^\d+$/.test(p1);
      const isNum2 = /^\d+$/.test(p2);

      if (isNum1 && isNum2) {
        // Both are numeric, compare as numbers
        const num1 = parseInt(p1, 10);
        const num2 = parseInt(p2, 10);
        if (num1 < num2) return -1;
        if (num1 > num2) return 1;
      } else if (isNum1 && !isNum2) {
        // Numeric identifiers always have lower precedence than non-numeric
        return -1;
      } else if (!isNum1 && isNum2) {
        // Non-numeric identifiers always have higher precedence than numeric
        return 1;
      } else {
        // Both are non-numeric, compare lexically
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
      }
    }

    // If all compared identifiers are equal, the one with more identifiers is greater
    if (pre1.length < pre2.length) return -1;
    if (pre1.length > pre2.length) return 1;
  }

  // Build metadata is ignored in version precedence according to semver
  // But we can still compare it for completeness if everything else is equal
  const build1 = version1.build || "";
  const build2 = version2.build || "";
  if (build1 < build2) return -1;
  if (build1 > build2) return 1;

  // All versions are equal
  return 0;
};

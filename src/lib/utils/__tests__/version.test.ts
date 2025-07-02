import { Version } from "api/js/types/v1/version_pb";
import { versionCompare, versionToString } from "../version";
import { describe, test, expect } from "vitest";

// Helper function to create Version objects
const createVersion = (
  major = 0,
  minor = 0,
  patch = 0,
  prereleases: string[] = [],
  build = "",
): Version => {
  const version = new Version();
  if (major !== 0) version.major = major;
  if (minor !== 0) version.minor = minor;
  if (patch !== 0) version.patch = patch;
  if (prereleases.length > 0) version.prereleases = prereleases;
  if (build) version.build = build;
  return version;
};

describe("versionCompare", () => {
  describe("Basic version comparison (major.minor.patch)", () => {
    test("compares major versions", () => {
      expect(
        versionCompare(createVersion(1, 0, 0), createVersion(2, 0, 0)),
      ).toBe(-1);
      expect(
        versionCompare(createVersion(2, 0, 0), createVersion(1, 0, 0)),
      ).toBe(1);
      expect(
        versionCompare(createVersion(1, 0, 0), createVersion(1, 0, 0)),
      ).toBe(0);
    });

    test("compares minor versions when major is equal", () => {
      expect(
        versionCompare(createVersion(1, 1, 0), createVersion(1, 2, 0)),
      ).toBe(-1);
      expect(
        versionCompare(createVersion(1, 2, 0), createVersion(1, 1, 0)),
      ).toBe(1);
      expect(
        versionCompare(createVersion(1, 1, 0), createVersion(1, 1, 0)),
      ).toBe(0);
    });

    test("compares patch versions when major and minor are equal", () => {
      expect(
        versionCompare(createVersion(1, 1, 1), createVersion(1, 1, 2)),
      ).toBe(-1);
      expect(
        versionCompare(createVersion(1, 1, 2), createVersion(1, 1, 1)),
      ).toBe(1);
      expect(
        versionCompare(createVersion(1, 1, 1), createVersion(1, 1, 1)),
      ).toBe(0);
    });
  });

  describe("Missing fields (protobuf default values)", () => {
    test("handles missing major field", () => {
      const v1 = createVersion(0, 8, 6); // major will be 0
      const v2 = createVersion(1, 0, 0);
      expect(versionCompare(v1, v2)).toBe(-1);
    });

    test("handles missing minor and patch fields", () => {
      const v1 = new Version(); // all fields default
      const v2 = createVersion(0, 0, 1);
      expect(versionCompare(v1, v2)).toBe(-1);
    });

    test("compares versions with missing fields", () => {
      // Simulating the example: { "minor": 8, "patch": 6, "prereleases": ["next", "1751363325"], "build": "59637b0" }
      const nextVersion = createVersion(
        0,
        8,
        6,
        ["next", "1751363325"],
        "59637b0",
      );
      const currentVersion = createVersion(0, 8, 5);
      expect(versionCompare(currentVersion, nextVersion)).toBe(-1);
    });
  });

  describe("Prerelease comparison", () => {
    test("version without prerelease > version with prerelease", () => {
      const stable = createVersion(1, 0, 0);
      const prerelease = createVersion(1, 0, 0, ["alpha"]);
      expect(versionCompare(prerelease, stable)).toBe(-1);
      expect(versionCompare(stable, prerelease)).toBe(1);
    });

    test("compares numeric prerelease identifiers", () => {
      const v1 = createVersion(1, 0, 0, ["alpha", "1"]);
      const v2 = createVersion(1, 0, 0, ["alpha", "2"]);
      expect(versionCompare(v1, v2)).toBe(-1);
      expect(versionCompare(v2, v1)).toBe(1);
    });

    test("compares numeric vs non-numeric identifiers", () => {
      const numeric = createVersion(1, 0, 0, ["alpha", "1"]);
      const nonNumeric = createVersion(1, 0, 0, ["alpha", "beta"]);
      expect(versionCompare(numeric, nonNumeric)).toBe(-1);
      expect(versionCompare(nonNumeric, numeric)).toBe(1);
    });

    test("compares non-numeric prerelease identifiers lexically", () => {
      const alpha = createVersion(1, 0, 0, ["alpha"]);
      const beta = createVersion(1, 0, 0, ["beta"]);
      const rc = createVersion(1, 0, 0, ["rc"]);

      expect(versionCompare(alpha, beta)).toBe(-1);
      expect(versionCompare(beta, rc)).toBe(-1);
      expect(versionCompare(alpha, rc)).toBe(-1);
    });

    test("compares prerelease with different lengths", () => {
      const shorter = createVersion(1, 0, 0, ["alpha"]);
      const longer = createVersion(1, 0, 0, ["alpha", "1"]);
      expect(versionCompare(shorter, longer)).toBe(-1);
      expect(versionCompare(longer, shorter)).toBe(1);
    });

    test("handles complex prerelease scenarios", () => {
      // Real-world examples
      const v1 = createVersion(0, 8, 6, ["next", "1751363325"]);
      const v2 = createVersion(0, 8, 6, ["next", "1751363326"]);
      expect(versionCompare(v1, v2)).toBe(-1);

      const v3 = createVersion(1, 0, 0, ["alpha", "1"]);
      const v4 = createVersion(1, 0, 0, ["alpha", "10"]);
      expect(versionCompare(v3, v4)).toBe(-1); // 1 < 10 (numeric comparison)
    });
  });

  describe("Build metadata comparison", () => {
    test("compares build metadata lexically", () => {
      const v1 = createVersion(1, 0, 0, [], "59637b0");
      const v2 = createVersion(1, 0, 0, [], "59637c1");
      expect(versionCompare(v1, v2)).toBe(-1);
    });

    test("handles missing build metadata", () => {
      const withBuild = createVersion(1, 0, 0, [], "build123");
      const withoutBuild = createVersion(1, 0, 0);
      expect(versionCompare(withoutBuild, withBuild)).toBe(-1);
    });

    test("build metadata doesn't affect version precedence (when other parts are different)", () => {
      const v1 = createVersion(1, 0, 0, [], "zzz");
      const v2 = createVersion(1, 0, 1, [], "aaa");
      expect(versionCompare(v1, v2)).toBe(-1); // patch difference takes precedence
    });
  });

  describe("Complex scenarios", () => {
    test("complete version comparison", () => {
      const versions = [
        createVersion(1, 0, 0, ["alpha"]),
        createVersion(1, 0, 0, ["alpha", "1"]),
        createVersion(1, 0, 0, ["alpha", "beta"]),
        createVersion(1, 0, 0, ["beta"]),
        createVersion(1, 0, 0, ["beta", "2"]),
        createVersion(1, 0, 0, ["beta", "11"]),
        createVersion(1, 0, 0, ["rc", "1"]),
        createVersion(1, 0, 0),
        createVersion(1, 0, 1, ["alpha"]),
        createVersion(1, 1, 0),
      ];

      // Verify they are in ascending order
      for (let i = 0; i < versions.length - 1; i++) {
        expect(versionCompare(versions[i], versions[i + 1])).toBe(-1);
      }
    });

    test("real-world example from the codebase", () => {
      // Current: 0.8.5, Next: 0.8.6-next.1751363325+59637b0
      const current = createVersion(0, 8, 5);
      const next = createVersion(0, 8, 6, ["next", "1751363325"], "59637b0");
      expect(versionCompare(current, next)).toBe(-1);
    });
  });
});

describe("versionToString", () => {
  test("formats basic version", () => {
    expect(versionToString(createVersion(1, 2, 3))).toBe("1.2.3");
  });

  test("formats version with prereleases", () => {
    expect(versionToString(createVersion(1, 2, 3, ["alpha", "1"]))).toBe(
      "1.2.3-alpha.1",
    );
  });

  test("formats version with build", () => {
    expect(versionToString(createVersion(1, 2, 3, [], "abc123"))).toBe(
      "1.2.3+abc123",
    );
  });

  test("formats complete version", () => {
    expect(
      versionToString(createVersion(1, 2, 3, ["beta", "2"], "build456")),
    ).toBe("1.2.3-beta.2+build456");
  });

  test("handles missing fields", () => {
    expect(versionToString(createVersion(0, 8, 6))).toBe("0.8.6");
  });
});

import { describe, it, expect } from "vitest";
import { Duration } from "@bufbuild/protobuf";
import {
  durationToString,
  wholeOrSingleDecimal,
} from "@/lib/utils/valueFormatters";

// Mock Duration creation helper
const createDuration = (seconds: number, nanos: number = 0): Duration => {
  const duration = new Duration();
  duration.seconds = BigInt(seconds);
  duration.nanos = nanos;
  return duration;
};

describe("durationToString", () => {
  describe("nanosecond units", () => {
    it("should format nanoseconds correctly", () => {
      expect(durationToString(createDuration(0, 500))).toBe("500ns");
    });

    it("should format microseconds correctly", () => {
      expect(durationToString(createDuration(0, 1500))).toBe("1.5µs");
      expect(durationToString(createDuration(0, 2000))).toBe("2µs");
    });

    it("should format milliseconds correctly", () => {
      expect(durationToString(createDuration(0, 1500000))).toBe("1.5ms");
      expect(durationToString(createDuration(0, 2000000))).toBe("2ms");
    });
  });

  describe("seconds units (less than 10)", () => {
    it("should format whole seconds correctly", () => {
      expect(durationToString(createDuration(5))).toBe("5s");
      expect(durationToString(createDuration(9))).toBe("9s");
    });

    it("should format decimal seconds correctly", () => {
      expect(durationToString(createDuration(1, 100000000))).toBe("1.1s"); // 1.1 seconds
      expect(durationToString(createDuration(5, 300000000))).toBe("5.3s"); // 5.3 seconds
    });

    it("original problem case: 1.033s should be formatted correctly", () => {
      // 330000000 nanos / 1e8 = 3.3 deciseconds → "1.3s"
      expect(durationToString(createDuration(1, 330000000))).toBe("1.3s");
    });
  });

  describe("seconds units (10+ seconds)", () => {
    it("should display 10-119 seconds in second units", () => {
      expect(durationToString(createDuration(30))).toBe("30s");
      expect(durationToString(createDuration(119))).toBe("119s");
    });
  });

  describe("minute units", () => {
    it("should format minute units correctly", () => {
      expect(durationToString(createDuration(120))).toBe("2m"); // 2 minutes
      expect(durationToString(createDuration(150))).toBe("2.5m"); // 2.5 minutes
      // 3599 seconds / 60 = 59.98333... → rounds to 60.0 → "60m"
      expect(durationToString(createDuration(3599))).toBe("60m");
    });
  });

  describe("hour units (where the original bug occurred)", () => {
    it('should display hour units with "h" correctly', () => {
      expect(durationToString(createDuration(3600))).toBe("1h"); // 1 hour
      expect(durationToString(createDuration(3600 + 1800))).toBe("1.5h"); // 1.5 hours
      expect(durationToString(createDuration(7200))).toBe("2h"); // 2 hours
    });

    it("cases where the original problem occurred", () => {
      const oneHour3Min = 3600 + 180; // 1 hour 3 minutes = 3780 seconds
      // 3780 / 3600 = 1.05 → rounds to 1.1h with toFixed(1)
      expect(durationToString(createDuration(oneHour3Min))).toBe("1.1h");
      // Previous bug: would have shown something like "1.0.3s"
    });
  });

  describe("day units and above", () => {
    it("should use toJsonString() for 24+ hours", () => {
      const duration = createDuration(24 * 60 * 60); // 24 hours
      // protobuf Duration.toJsonString() returns quoted string
      expect(durationToString(duration)).toBe('"86400s"');
    });
  });

  describe("boundary value tests", () => {
    it("should work correctly at each threshold", () => {
      // 999999999 nanos / 1e8 = 9.99999999 → rounds to 10.0 → "9.10s"
      expect(durationToString(createDuration(9, 999999999))).toBe("9.10s");
      expect(durationToString(createDuration(10))).toBe("10s");
      expect(durationToString(createDuration(119))).toBe("119s");
      expect(durationToString(createDuration(120))).toBe("2m");
      // 3599 / 60 = 59.98333... → rounds to 60.0 → "60m"
      expect(durationToString(createDuration(3599))).toBe("60m");
      expect(durationToString(createDuration(3600))).toBe("1h");
    });
  });
});

export { durationToString, wholeOrSingleDecimal };

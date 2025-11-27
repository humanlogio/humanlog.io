// src/hooks/usePasswordStrength.ts
import { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";

export interface PasswordStrength {
  score: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crackTimesDisplay: {
    onlineThrottling100PerHour: string | number;
    onlineNoThrottling10PerSecond: string | number;
    offlineSlowHashing1e4PerSecond: string | number;
    offlineFastHashing1e10PerSecond: string | number;
  };
  isValid: boolean;
  strengthText: string;
  strengthColor: string;
}

export const usePasswordStrength = (
  password: string,
  userInputs?: string[],
): PasswordStrength => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: { warning: "", suggestions: [] },
    crackTimesDisplay: {
      onlineThrottling100PerHour: "",
      onlineNoThrottling10PerSecond: "",
      offlineSlowHashing1e4PerSecond: "",
      offlineFastHashing1e10PerSecond: "",
    },
    isValid: false,
    strengthText: "Very Weak",
    strengthColor: "text-red-500",
  });

  useEffect(() => {
    if (!password) {
      setStrength((prev) => ({ ...prev, score: 0, isValid: false }));
      return;
    }

    const result = zxcvbn(password, userInputs);

    const strengthTexts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
      "text-red-500",
      "text-orange-500",
      "text-yellow-500",
      "text-blue-500",
      "text-green-500",
    ];

    setStrength({
      score: result.score,
      feedback: {
        warning: result.feedback.warning || "",
        suggestions: result.feedback.suggestions,
      },
      crackTimesDisplay: {
        onlineThrottling100PerHour:
          result.crack_times_display.online_throttling_100_per_hour,
        onlineNoThrottling10PerSecond:
          result.crack_times_display.online_no_throttling_10_per_second,
        offlineSlowHashing1e4PerSecond:
          result.crack_times_display.offline_slow_hashing_1e4_per_second,
        offlineFastHashing1e10PerSecond:
          result.crack_times_display.offline_fast_hashing_1e10_per_second,
      },
      isValid: result.score >= 2,
      strengthText: strengthTexts[result.score],
      strengthColor: strengthColors[result.score],
    });
  }, [password, userInputs]);

  return strength;
};

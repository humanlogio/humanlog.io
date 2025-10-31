import { PasswordStrength } from "@/hooks/usePasswordStrength";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
  showFeedback?: boolean;
}

export const PasswordStrengthIndicator = ({
  strength,
  password,
  showFeedback = false,
}: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const getBarColor = (index: number) => {
    if (index <= strength.score) {
      switch (strength.score) {
        case 0:
          return "bg-red-500";
        case 1:
          return "bg-orange-500";
        case 2:
          return "bg-yellow-500";
        case 3:
          return "bg-blue-500";
        case 4:
          return "bg-green-500";
        default:
          return "bg-gray-200";
      }
    }
    return "bg-gray-200";
  };

  return (
    <div className="mt-2 space-y-1">
      {/* strength bar */}
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded ${getBarColor(index)}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${strength.strengthColor}`}>
          {strength.strengthText}
        </span>
        {/* <span className="text-xs text-gray-500">
          {strength.crackTimesDisplay.offlineSlowHashing1e4PerSecond}
        </span> */}
      </div>

      {/* feedback */}
      {strength.feedback.warning && showFeedback && (
        <p className="text-xs text-orange-600">{strength.feedback.warning}</p>
      )}

      {strength.feedback.suggestions.length > 0 && showFeedback && (
        <ul className="space-y-1 text-xs text-gray-600">
          {strength.feedback.suggestions.map((suggestion, index) => (
            <li key={index}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

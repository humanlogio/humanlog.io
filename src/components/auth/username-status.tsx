import { Loader2 } from "lucide-react";
import { CheckIcon, CloseIcon } from "public/icons";

export type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "tooShort"
  | "tooLong"
  | "invalidFormat"
  | "error";

export const UsernameStatusIcon = ({ status }: { status: UsernameStatus }) => {
  switch (status) {
    case "checking":
      return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
    case "available":
      return <CheckIcon />;
    case "taken":
      return <CloseIcon />;
    default:
      return null;
  }
};

export const UsernameStatusText = ({ status }: { status: UsernameStatus }) => {
  switch (status) {
    case "checking":
      return <p className="text-xs text-gray-500">Checking availability...</p>;
    case "available":
      return <p className="text-xs text-green-600">Username is available</p>;
    case "taken":
      return (
        <p className="text-destructive text-sm">Username is already taken</p>
      );
    case "tooLong":
      return (
        <p className="text-destructive text-xs">
          Username must be less than 39 characters
        </p>
      );
    case "tooShort":
      return (
        <p className="text-destructive text-xs">
          Username must be at least 3 characters
        </p>
      );
    case "invalidFormat":
      return (
        <p className="text-destructive text-xs">
          Username can only contain letters, numbers, and hyphens
        </p>
      );
    case "error":
      return (
        <p className="text-destructive text-xs">
          Unable to check availability. Please try again.
        </p>
      );
    default:
      return null;
  }
};

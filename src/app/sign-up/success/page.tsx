import { CheckIcon } from "public/icons";

export default function SignUpSuccessPage() {
  return (
    <div className="flex flex-col items-center gap-3">
      <CheckIcon width="32" height="32" />
      <p className="text-xl font-semibold">You’re all set!</p>
    </div>
  );
}

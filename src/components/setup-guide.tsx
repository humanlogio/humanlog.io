import { Copy } from "lucide-react";
import { getSelfURL } from "@/lib/envs";
import { copyToClipboard } from "@/lib/utils/clipboard";

const SetupGuide: React.FC = () => {
  const origin = getSelfURL();
  const installScript = `curl -sSL "${origin}/install.sh" | bash`;

  return (
    <div className="container flex flex-grow flex-col items-center justify-center gap-8">
      <div>
        <h1 className="text-center text-4xl font-bold">Get Started</h1>
        <p className="mt-4 text-center text-slate-500">
          Logs for humans to read.
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Install</span>
        <code className="rounded-base bg-slate-200 px-2 py-0.5 dark:bg-slate-950">
          humanlog
        </code>
      </div>
      <div
        onClick={() => copyToClipboard(installScript)}
        tabIndex={1}
        className="rounded-base flex w-full max-w-2xl cursor-pointer flex-row items-center justify-between gap-4 bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
      >
        <code className="truncate">{installScript}</code>
        <Copy size={14} className="flex-none" />
      </div>
      <p>and then use it!</p>
      <div
        onClick={() => copyToClipboard("humanlog config enable query-engine")}
        tabIndex={2}
        className="rounded-base flex w-full max-w-2xl cursor-pointer flex-row items-center justify-between gap-4 bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
      >
        <code className="truncate">
          {JSON.stringify("$ humanlog config enable query-engine").slice(1, -1)}
        </code>
        <Copy size={14} className="flex-none" />
      </div>
    </div>
  );
};
export default SetupGuide;

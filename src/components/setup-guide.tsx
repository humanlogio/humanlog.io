import { Copy } from "lucide-react";

const SetupGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optionally, you can add some visual feedback here
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-8">
      <div>
        <h1 className="text-center text-4xl font-bold">Get Started</h1>
        <p className="mt-4 text-center text-slate-500">
          Logs for humans to read.
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Install</span>
        <span className="rounded-base bg-slate-200 px-2 py-0.5 dark:bg-slate-950">
          humanlog
        </span>
      </div>
      <div
        onClick={() =>
          copyToClipboard('curl -L "https://humanlog.io/install.sh" | sh')
        }
        tabIndex={1}
        className="flex w-full max-w-xl cursor-pointer flex-row items-center justify-between gap-4 rounded-base bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
      >
        <span className="truncate">
          curl -L "https://humanlog.io/install.sh" | sh
        </span>
        <Copy size={14} />
      </div>
      <p>and then use it!</p>
      <div
        onClick={() => copyToClipboard("$ my_server 2>&1 | humanlog")}
        tabIndex={2}
        className="flex w-full max-w-xl cursor-pointer flex-row items-center justify-between gap-4 rounded-base bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
      >
        <span className="truncate">
          {JSON.stringify("$ my_server 2>&1 | humanlog").slice(1, -1)}
        </span>
        <Copy size={14} />
      </div>
    </div>
  );
};
export default SetupGuide;

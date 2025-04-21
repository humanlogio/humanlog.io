"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { Copy } from "lucide-react";

export const NoLocalhostView = () => {
  const setUpCommand = "humanlog config enable query-engine";
  const installCommand = "humanlog service install";
  const startCommand = "humanlog service start";

  return (
    <div className="max-w-2xl text-center">
      <h1 className="text-center text-2xl font-bold">
        {"Uh oh! It looks like you're not running"}
        <br /> {"the localhost query engine."}
      </h1>
      <div className="mt-10 flex flex-col items-center gap-2">
        Set up with:
        <div
          onClick={() => copyToClipboard(setUpCommand)}
          tabIndex={1}
          className="flex w-full cursor-pointer flex-row items-center justify-between gap-4 rounded-md bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
        >
          <code className="truncate">{setUpCommand}</code>
          <Copy size={14} className="flex-none" />
        </div>
        <div>And then run some queries!</div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        If you already enabled the query engine and you still see this page,
        <br />
        make sure the service is installed:
        <div
          onClick={() => copyToClipboard(installCommand)}
          tabIndex={1}
          className="flex w-full cursor-pointer flex-row items-center justify-between gap-4 rounded-md bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
        >
          <code className="truncate">{installCommand}</code>
          <Copy size={14} className="flex-none" />
        </div>
        <br />
        and make sure the service is running:
        <div
          onClick={() => copyToClipboard(startCommand)}
          tabIndex={1}
          className="flex w-full cursor-pointer flex-row items-center justify-between gap-4 rounded-md bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
        >
          <code className="truncate">{startCommand}</code>
          <Copy size={14} className="flex-none" />
        </div>
      </div>
    </div>
  );
};

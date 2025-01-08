"use client";

import { Copy, Loader } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { useAllEnvironments } from "@/context/list-environments";

export default function Page() {
  const { user } = useAllEnvironments();

  const demoString = `humanlog configure advanced`;

  let content;
  if (user === "not-logged-in") {
    content = (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <h1 className="text-center text-4xl font-bold">You need to login.</h1>
      </div>
    );
  } else if (user === "loading") {
    content = (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <h1 className="text-center text-4xl font-bold">
          Verifying your identity...
        </h1>
        <Loader className="animate-spin"></Loader>
      </div>
    );
  } else {
    content = (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <div>
          <h1 className="text-center text-4xl font-bold">
            Hi {user.firstName!}!
          </h1>
          <p className="mt-4 text-center text-slate-500">
            {"Purchase completed!"}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <span>You can now use advanced features in humanlog</span>
        </div>
        <div
          onClick={() => copyToClipboard(demoString)}
          tabIndex={2}
          className="flex w-full max-w-xl cursor-pointer flex-row items-center justify-between gap-4 rounded-base bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
        >
          <code className="truncate">
            {JSON.stringify(`$ ${demoString}`).slice(1, -1)}
          </code>
          <Copy size={14} />
        </div>
      </div>
    );
  }

  return <div className="container-h-full flex flex-col py-8">{content}</div>;
}

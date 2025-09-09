"use client";

import { Copy, Loader } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { useAllEnvironments } from "@/context/list-environments";
import LoadingIndicator from "@/components/loading-indicator";

export default function Page() {
  const { userInfo } = useAllEnvironments();

  const demoString = `humanlog --help`;

  if (userInfo === "isLoading") {
    return <LoadingIndicator />;
  }

  if (!userInfo) {
    return (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <h1 className="text-center text-4xl font-bold">You need to login.</h1>
      </div>
    );
  }

  return (
    <div className="container flex flex-grow flex-col items-center justify-center gap-8">
      <div>
        <h1 className="text-center text-4xl font-bold">
          Hi {userInfo.user?.firstName}
        </h1>
        <p className="text-muted-foreground mt-4 text-center">
          {"You're logged in!"}
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>You can go back in your terminal :)</span>
      </div>
      <div
        onClick={() => copyToClipboard(demoString)}
        tabIndex={2}
        className="flex w-full max-w-xl cursor-pointer flex-row items-center justify-between gap-4 rounded-md bg-slate-200 px-4 py-3 hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 dark:bg-slate-950"
      >
        <code className="truncate">
          {JSON.stringify(`$ ${demoString}`).slice(1, -1)}
        </code>
        <Copy size={14} />
      </div>
    </div>
  );
}

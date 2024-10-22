"use client";

import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { useAllAccounts } from "@/context/listAccounts";
import { md5 } from "js-md5";

export default function Page() {
  const { user } = useAllAccounts();

  const demoString = `humanlog --help`

  let content;
  if (!user) {
    content = <div className="mx-auto flex w-full max-w-screen-xl flex-grow flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-center text-4xl font-bold">You need to login.</h1>
    </div>
  } else {
    content = <div className="mx-auto flex w-full max-w-screen-xl flex-grow flex-col items-center justify-center gap-8 px-4">
      <div>
        <h1 className="text-center text-4xl font-bold">Hi {user.firstName!}!</h1>
        <p className="mt-4 text-center text-slate-500">
          You're logged in!
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>You can go back in your terminal :)</span>
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
    </div >
  }
  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col py-8">
      {content}
    </div>
  );
}

export const gravatarURL = (email: string | undefined) => {
  if (!email) return undefined;
  return `https://www.gravatar.com/avatar/${md5(email)}`;
};

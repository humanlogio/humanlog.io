"use client";

import { useState, useEffect } from "react";
import { Copy, Loader } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { useAllEnvironments } from "@/context/list-environments";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GetAuthURLRequest } from "api/js/svc/auth/v1/service_pb";
import { useApiClients } from "@/context/api-provider";

export default function Page() {
  const { user } = useAllEnvironments();
  const [authURL, setAuthURL] = useState<string | null>(null);
  const { apiClients } = useApiClients();

  useEffect(() => {
    (async () => {
      const returnToUrl = window.location.href;
      const req = new GetAuthURLRequest({ returnToUrl: returnToUrl });
      try {
        const res = await apiClients?.auth.getAuthURL(req);
        if (!res || !res.authUrl) {
          return;
        }
        setAuthURL(res?.authUrl);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [apiClients?.auth]);

  const demoString = `humanlog --help`;

  let content;
  if (!authURL) {
    content = (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <Loader className="animate-spin md:text-white" />

        <p>Loading login interface...</p>
      </div>
    );
  } else if (user === "not-logged-in") {
    content = (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <Link href={authURL}>
          <Button variant="noShadowNeutral" className="w-full">
            Sign up
          </Button>
        </Link>
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
          <p className="mt-4 text-center text-slate-500">You're logged in!</p>
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
      </div>
    );
  }

  return <div className="flex flex-col py-8">{content}</div>;
}

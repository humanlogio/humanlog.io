"use client";

import { useAllEnvironments } from "@/context/list-environments";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  const { user } = useAllEnvironments();

  let supportMethodList;
  if (user === "not-logged-in" || user === "loading") {
    supportMethodList = <></>;
  } else {
    supportMethodList = (
      <div className="flex flex-row items-center gap-2">
        <p>
          <Link href="mailto:support@webscale.lol">Contact us by Email</Link>
        </p>
      </div>
    );
    // TODO: link to special channel for paying customers
  }
  return (
    <div className="flex flex-col py-8">
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <div>
          <h1 className="text-center text-4xl font-bold">Support</h1>
        </div>
      </div>
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        <div>
          <p className="mt-4 text-center text-slate-500">
            Need help? Wanna talk?
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            <p className="mt-4 text-center text-slate-500">Contact us!</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p>
              <Link href="link/discord">Community support on Discord</Link>
            </p>
          </div>
          {supportMethodList}
        </div>
      </div>
    </div>
  );
}

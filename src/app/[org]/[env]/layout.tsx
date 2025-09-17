"use client";

import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useAllEnvironments } from "@/context/list-environments";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const currentEnvSlug = params?.env as string;
  const { localhostInfo } = useAllEnvironments();

  if (!localhostInfo && currentEnvSlug === "localhost") {
    return (
      <div className="mt-32 flex justify-center">
        <NoLocalhostView />
      </div>
    );
  }

  return children;
}

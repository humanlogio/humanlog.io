"use client";

import { useEffect } from "react";
import SetupGuide from "@/components/setup-guide";
import { useAllEnvironments } from "@/context/list-environments";
import PreviewCode from "@/components/env/previewCode";
import config from "@/features/config";

import { useRouter } from "next/navigation";

const LogInterface = () => {
  const router = useRouter();
  const signupOnly = config.NEXT_PUBLIC_SIGNUP_ONLY;
  const { hasLocalhost, listEnvironments } = useAllEnvironments();

  useEffect(() => {
    if (signupOnly || (!hasLocalhost && !listEnvironments.length)) return;
    router.push("/query");
  }, [signupOnly, hasLocalhost, listEnvironments]);

  return (
    <section>
      <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
        <SetupGuide />
        <PreviewCode />
      </div>
    </section>
  );
};

export default LogInterface;

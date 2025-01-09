"use client";

import { useState } from "react";
import SetupGuide from "@/components/setup-guide";
import { useAllEnvironments } from "@/context/list-environments";
import QueryOutput from "@/components/env/query-output";
import QueryInput from "@/components/env/query-input";
import { LogEventGroup } from "@/components/sortable/session-container";
import PreviewCode from "@/components/env/previewCode";
import config from "@/features/config";

const LogInterface = () => {
  const signupOnly = config.NEXT_PUBLIC_SIGNUP_ONLY;
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const [sessions, setSessions] = useState<LogEventGroup[] | null>(null);

  return (
    <section>
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
          <SetupGuide />
          <PreviewCode />
        </div>
      ) : (
        <div className="container-h-full flex flex-col gap-4 overflow-y-hidden py-8">
          <QueryInput setSessions={setSessions} />
          <QueryOutput sessions={sessions} />
        </div>
      )}
    </section>
  );
};

export default LogInterface;

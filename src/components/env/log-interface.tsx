"use client";

import { useState } from "react";
import SetupGuide from "@/components/setup-guide";
import { useAllEnvironments } from "@/context/list-environments";
import QueryOutput from "@/components/env/query-output";
import QueryInput from "@/components/env/query-input";
import { LogEventGroup } from "@/components/sortable/session-container";
import PreviewCode from "@/components/env/previewCode";


const LogInterface = () => {
  const signupOnly = config.NEXT_PUBLIC_SIGNUP_ONLY;
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const [sessions, setSessions] = useState<LogEventGroup[] | null>(null);

  return (
    <section className="flex flex-col gap-4">
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <div className="grid grid-cols-1 gap-48 lg:gap-72 py-44 lg:py-60 w-full">
          <SetupGuide />
          <PreviewCode />
        </div>
      ) : (
        <>
          <QueryInput setSessions={setSessions} />
          <QueryOutput sessions={sessions} />
        </>
      )}
    </section>
  );
};

export default LogInterface;

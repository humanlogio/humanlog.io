"use client";

import SetupGuide from "@/components/setup-guide";
import { useAllEnvironments } from "@/context/list-environments";
import QueryOutput from "@/components/env/query-output";
import QueryInput from "@/components/env/query-input";
import { useState } from "react";
import { LogEventGroup } from "@/components/sortable/session-container";
import config from "@/features/config";

const LogInterface = () => {
  const signupOnly = config.NEXT_PUBLIC_SIGNUP_ONLY
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const [sessions, setSessions] = useState<LogEventGroup[] | null>(null);

  return (
    <section className="container-h-full flex flex-col gap-4 overflow-y-hidden py-8">
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <SetupGuide />
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

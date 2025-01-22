"use client";

import { useState } from "react";
import SetupGuide from "@/components/setup-guide";
import { useAllEnvironments } from "@/context/list-environments";
import QueryOutput from "@/components/env/query-output";
import QueryInput from "@/components/env/query-input";
import { LogEventGroup } from "@/components/sortable/session-container";
import PreviewCode from "@/components/env/previewCode";
import config from "@/features/config";
import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";
import NewQueryOutput from "./new-query-output";
import NewQueryInput from "./new-query-input";

export interface LogData {
  case:
    | "subqueries"
    | "tabular"
    | "singleValue"
    | "scalarTimeseries"
    | "vectorTimeseries"
    | undefined;
  value:
    | Data_SubQueries
    | Tabular
    | Val
    | ScalarTimeseries
    | VectorTimeseries
    | undefined;
}

const LogInterface = () => {
  const signupOnly = config.NEXT_PUBLIC_SIGNUP_ONLY;
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [fetchNext, setFetchNext] = useState(false);

  return (
    <section>
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
          <SetupGuide />
          <PreviewCode />
        </div>
      ) : (
        <div className="container-h-full flex flex-col gap-4 overflow-y-hidden py-8">
          <NewQueryInput
            setLogData={setLogData}
            fetchNext={fetchNext}
            setIsFetching={setIsFetching}
          />
          <NewQueryOutput
            logData={logData}
            setFetchNext={setFetchNext}
            isFetching={isFetching}
          />
          {/* <QueryOutput shapeCase={shapeCase} sessions={sessions} /> */}
        </div>
      )}
    </section>
  );
};

export default LogInterface;

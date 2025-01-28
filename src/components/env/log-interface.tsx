"use client";

import { useState } from "react";
import SetupGuide from "@/components/setup-guide";
import { useAllEnvironments } from "@/context/list-environments";
import PreviewCode from "@/components/env/previewCode";
import config from "@/features/config";
import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";
import NewQueryOutput from "@/components/env/new-query-output";
import NewQueryInput from "@/components/env/new-query-input";
import { LogQuery } from "api/js/types/v1/logquery_pb";

export type DataCase =
  | "subqueries"
  | "tabular"
  | "singleValue"
  | "scalarTimeseries"
  | "vectorTimeseries"
  | undefined;

export type DataValue =
  | Data_SubQueries
  | Tabular
  | Val
  | ScalarTimeseries
  | VectorTimeseries
  | undefined;

export interface LogData {
  case: DataCase;
  value?: DataValue;
}

const LogInterface = () => {
  const signupOnly = config.NEXT_PUBLIC_SIGNUP_ONLY;
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });
  const [parsedQuery, setParsedQuery] = useState<LogQuery>();
  const [splitByDefault, setSplitByDefault] = useState(true);

  return (
    <section>
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
          <SetupGuide />
          <PreviewCode />
        </div>
      ) : (
        <div className="container-min-h-full flex flex-col gap-4 overflow-y-hidden py-8">
          <NewQueryInput
            setParsedQuery={setParsedQuery}
            setLogData={setLogData}
            splitByDefault={splitByDefault}
          />
          <NewQueryOutput
            parsedQuery={parsedQuery}
            logData={logData}
            splitByDefault={splitByDefault}
            setSplitByDefault={setSplitByDefault}
          />
        </div>
      )}
    </section>
  );
};

export default LogInterface;

"use client";

import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import { useApiClients } from "@/context/api-provider";
import { formatTimestamp, getTimeSince } from "@/lib/utils/format-timestamp";
import { getPublicSharedResult } from "@/services/shareService";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Table } from "api/js/types/v1/types_pb";
import { PublicUser, User } from "api/js/types/v1/user_pb";
import {
  Clock,
  Code,
  Database,
  Loader,
  Share2,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import QueryInput from "@/components/log-interface/query-input";
import { useRouter } from "next/navigation";
import { FreeFormContainer } from "@/components/log-interface/query-output/freeform";
import { Spans } from "api/js/types/v1/data_pb";
import { SpansContainer } from "@/components/log-interface/query-output/spans/spans-container";
import { Log } from "api/js/types/v1/otel_logging_pb";
import LoadingIndicator from "@/components/loading-indicator";

interface SharedQueryProps {
  sharedId: string;
  prefix?: string;
}

export const SharedQuery = ({ sharedId, prefix }: SharedQueryProps) => {
  const router = useRouter();
  const { apiClients } = useApiClients();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);

  const [sharedBy, setSharedBy] = useState<PublicUser | null>(null);
  const [query, setQuery] = useState<QueryHistoryEntry | null>(null);

  const [logData, setLogData] = useState<Log[] | null>(null);
  const [freeFormData, setFreeFormData] = useState<Table | null>();
  const [spanData, setSpanData] = useState<Spans | null>();
  const [sharedTimestamp, setSharedTimestamp] = useState<any>(null);
  const [editorContent, setEditorContent] = useState("");

  const handleSharedResult = async () => {
    if (!apiClients) {
      setIsLoading(false);
      return;
    }

    await getPublicSharedResult(
      apiClients.publicShare,
      sharedId as string,
      prefix as string,
      {
        onSuccess: (res) => {
          const { sharedBy: _sharedBy, sharedResult } = res;
          setSharedBy(_sharedBy || null);

          if (!sharedResult) return;

          const { query: _query, result: _result, createdAt } = sharedResult;

          if (!_result?.shape) return;

          const { case: shapeCase, value: shapeValue } = _result.shape;

          setQuery(_query || null);

          setSharedTimestamp(createdAt || null);

          switch (shapeCase) {
            case "logs":
              setLogData(shapeValue.logs || null);
              break;
            case "freeForm":
              setFreeFormData(shapeValue);
              break;
            case "spans":
              setSpanData(shapeValue);
          }

          setIsLoading(false);
        },
        onError: (err) => {
          setIsLoading(false);
        },
      },
    );
  };

  useEffect(() => {
    handleSharedResult();
  }, [apiClients, sharedId, prefix]);

  useEffect(() => {
    setEditorContent(query?.rawQuery ?? "");
  }, [query]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className={`flex h-full flex-col pb-12`}>
      {/* Header Section */}
      <div className="mb-8 flex-none border-b border-gray-200">
        <div className={`px-8 py-6`}>
          <div className="mb-4 flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Shared Query Result
            </h1>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
            {sharedBy && (
              <div className="flex items-center">
                <UserIcon className="mr-1.5 h-4 w-4 text-gray-500" />
                <span>Shared by: {sharedBy.username}</span>
              </div>
            )}

            {sharedTimestamp && (
              <div className="flex items-center">
                <Clock className="mr-1.5 h-4 w-4 text-gray-500" />
                <span>
                  Shared:{" "}
                  {formatTimestamp(sharedTimestamp, "ddd MMM D HH:mm:ss YYYY")}(
                  {getTimeSince(sharedTimestamp)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col px-8`}>
        {/* Query Section */}
        <div className="mb-8 flex-none">
          <div className="mb-3 flex items-center">
            <Code className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Query
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 p-2">
            <QueryInput
              errMsg=""
              onExecuteQuery={() => {}}
              editorContent={editorContent}
              setEditorContent={(val) => setEditorContent(val)}
              parsedQuery={query?.query}
              fromExternalPage
            />
          </div>
        </div>

        {/* Result Section */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex flex-none items-center">
            <Database className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Result
            </h2>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
            {logData && (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <SessionPanel logs={logData} />
              </div>
            )}

            {freeFormData && (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <FreeFormContainer freeForm={[freeFormData]} />
              </div>
            )}

            {spanData && (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <SpansContainer spans={spanData.spans} />
              </div>
            )}

            {!logData && !freeFormData && !spanData && (
              <div className="p-6 text-center text-gray-500">
                No result data to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

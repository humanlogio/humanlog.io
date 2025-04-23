"use client";

import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import TableContainer from "@/components/log-interface/query-output/table/table-container";
import { useApiClients } from "@/context/api-provider";
import { useFullWidth } from "@/context/full-width-provider";
import { formatTimestamp, getTimeSince } from "@/lib/utils/formatTimeStamp";
import { getPublicSharedResult } from "@/services/shareService";

import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Table } from "api/js/types/v1/types_pb";
import { User } from "api/js/types/v1/user_pb";
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

interface SharedQueryProps {
  sharedId: string;
  prefix?: string;
}

export const SharedQuery = ({ sharedId, prefix }: SharedQueryProps) => {
  const { apiClients } = useApiClients();
  const { isFullWidth } = useFullWidth();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);

  const [sharedBy, setSharedBy] = useState<User | null>(null);
  const [query, setQuery] = useState<QueryHistoryEntry | null>(null);

  const [logData, setLogData] = useState<IngestedLogEvent[] | null>(null);
  const [tableData, setTableData] = useState<Table | null>(null);
  const [sharedTimestamp, setSharedTimestamp] = useState<any>(null);

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

          if (sharedResult) {
            const { query: _query, result: _result, createdAt } = sharedResult;
            setQuery(_query || null);

            setSharedTimestamp(createdAt || null);

            if (_result?.shape.case === "tabular") {
              if (_result.shape.value.shape.case === "logEvents") {
                setLogData(_result.shape.value.shape.value.events || null);
              }
              if (_result.shape.value.shape.case === "freeForm") {
                setTableData(_result.shape.value.shape.value || null);
              }
            }
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center">
        <Loader className="mx-auto mb-4 h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-12 ${!isFullWidth && "container mx-auto"}`}
    >
      {/* Header Section */}
      <div className="mb-8 border-b border-gray-200">
        <div className={`px-8 py-6 ${!isFullWidth && "container mx-auto"}`}>
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

      <div className={`px-8 ${!isFullWidth && "container mx-auto"}`}>
        {/* Query Section */}
        <div className="mb-8">
          <div className="mb-3 flex items-center">
            <Code className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Query
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <pre className="p-4 font-mono text-sm break-words whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {query?.rawQuery}
            </pre>
          </div>
        </div>

        {/* Result Section */}
        <div>
          <div className="mb-3 flex items-center">
            <Database className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Result
            </h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            {logData && (
              <div className="p-4">
                <SessionPanel
                  darkMode={theme === "dark"}
                  onClickFilterBy={() => {}}
                  providedData={logData}
                  query={undefined}
                />
              </div>
            )}

            {tableData && (
              <div className="p-4">
                <TableContainer query={undefined} providedData={tableData} />
              </div>
            )}

            {!logData && !tableData && (
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

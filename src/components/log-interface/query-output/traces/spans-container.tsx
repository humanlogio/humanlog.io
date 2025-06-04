import { useInfiniteQuery } from "@/lib/hooks/useInfiniteQuery";
import { Spans } from "api/js/types/v1/data_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Query } from "api/js/types/v1/query_pb";
import { Span } from "api/js/types/v1/tracing_pb";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Network } from "lucide-react";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { extractFromStreamResponses } from "@/lib/utils/dataHelpers";

import { ServiceMap } from "@/components/log-interface/query-output/traces/service-map";
import { SpanList } from "@/components/log-interface/query-output/traces/span-list";
import { getSampleScenarioByName } from "@/components/log-interface/query-output/traces/service-map/utils/sample-data-generator";
import FeatureFlag from "@/components/posthog/feature-flag";

interface FreeFormContainerProps {
  query: Query | undefined;
  data?: Spans;
  initialNext?: Cursor | null;
  providedData?: Spans;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
}

export const SpansContainer = ({
  query,
  data,
  initialNext,
  providedData,
  queryHistoryEntry,
  streamRes,
}: FreeFormContainerProps) => {
  const { targetRef, fetchNext, fetchData, next, setNext } =
    useInfiniteQuery(query);
  const [spans, setSpans] = useState<Span[]>();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    if (providedData) {
      setSpans(providedData.spans);
      return;
    } else if (data) {
      setNext(initialNext);
      setSpans(data.spans);
    } else {
      fetchData(({ value: shapeValue }) => {
        setSpans(shapeValue.spans);
      });
    }

    // fake data
    // const sampleScenario = getSampleScenarioByName("E-Commerce Checkout");
    // if (sampleScenario) {
    //   setSpans(sampleScenario.spans);
    // }
  }, []);

  useEffect(() => {
    next &&
      fetchNext &&
      fetchData(({ value: shapeValue }) => {
        setSpans((prev) => {
          if (prev) {
            return [...prev, ...shapeValue.spans];
          }
        });
      });
  }, [fetchNext]);

  useEffect(() => {
    if (!streamRes || streamRes.length === 0) return;
    const _spans = extractFromStreamResponses<Span, Spans>(
      streamRes,
      (value) => value.spans,
    );
    setSpans(_spans);
  }, [streamRes]);

  if (!spans) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <FeatureFlag flagKey="service-map-enabled" fallback={null}>
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none border-r"
            >
              <List size={16} className="mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="rounded-l-none"
            >
              <Network size={16} className="mr-1" />
              Service Map
            </Button>
          </div>
        </div>
      </FeatureFlag>

      {/* Spans list */}
      {viewMode === "list" && (
        <SpanList
          spans={spans}
          queryHistoryEntry={queryHistoryEntry}
          targetRef={targetRef}
        />
      )}

      {/* Service Map */}
      {viewMode === "map" && <ServiceMap spans={spans} />}
    </>
  );
};

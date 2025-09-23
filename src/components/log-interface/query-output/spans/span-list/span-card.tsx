import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import {
  Activity,
  Clock,
  Copy,
  FileText,
  LinkIcon,
  Search,
  Server,
  Share,
} from "lucide-react";
import Link from "next/link";
import { Timestamp } from "@bufbuild/protobuf/wkt";
import { Button } from "@/components/ui/button";
import { unit8ArrayBufferToBase16 } from "@/lib/utils/decode";
import { copyToClipboard } from "@/lib/utils/clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilterByKeyValue } from "@/components/log-interface/query-output/session/session-control";
import { newLiteralExpr } from "@/lib/utils/queryExpressions";
import { newIdentifierExpr } from "@/lib/utils/queryExpressions";
import { KeyValueRow } from "@/components/log-interface/query-output/session/session-control";
import { newIndexorExpr } from "@/lib/utils/queryExpressions";
import { newStrVal } from "@/lib/utils/valueFactories";
import { memo, MouseEvent, useCallback, useEffect } from "react";
import { buildOrgEnvUrl, getOrgEnvUrl } from "@/lib/utils/navigation";
import { useAllEnvironments } from "@/context/list-environments";
import { useEnvironmentStore } from "@/stores/environment-store";
import { usePage } from "@/stores/page-store";
import { spanIdToString, traceIdToString } from "@/lib/utils/id-factories";

interface SpanCardProps {
  index: number;
  span: Span;
}

export const SpanCard = memo(({ index, span }: SpanCardProps) => {
  if (!span) return <div></div>;

  const lineId = `${index}-${traceIdToString(span.traceId)}-${spanIdToString(span.spanId)}`;

  const traceId = unit8ArrayBufferToBase16(span.traceId?.raw);
  const spanId = unit8ArrayBufferToBase16(span.spanId?.raw);
  const { userInfo } = useAllEnvironments();
  const { activeEnvironment } = useEnvironmentStore();
  const { activePage, setActivePage } = usePage();
  const handleCopy = useCallback(
    (e: MouseEvent, id: string) => {
      e.preventDefault();
      copyToClipboard(id);
    },
    [traceId, spanId],
  );

  useEffect(() => {
    setActivePage("traces");
  }, [activePage]);

  const getHref = () => {
    return getOrgEnvUrl(
      userInfo,
      activeEnvironment,
      `traces?traceId=${encodeURIComponent(traceId)}`,
    );
  };

  return (
    <div key={lineId} className="my-3">
      <Card className="overflow-hidden transition-colors hover:border-blue-300">
        <CardHeader className="bg-gray-50 p-4 dark:bg-gray-800/60">
          <Link
            href={getHref()}
            className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {span.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700"
              >
                <Server size={12} />
                {span.serviceName}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              >
                <Clock size={12} />
                {formatDuration(span.duration)}
              </Badge>
              {span.events?.length > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                >
                  <FileText size={12} />
                  {span.events.length} Events
                </Badge>
              )}
              {span.links?.length > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                >
                  <LinkIcon size={12} />
                  {span.links.length} Links
                </Badge>
              )}
            </div>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-0">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="text-sm text-gray-500">
                  {formatTimestamp(span.time as Timestamp)}
                </div>
                <AccordionTrigger className="py-0">
                  <span className="sr-only">View Details</span>
                </AccordionTrigger>
              </div>

              <AccordionContent>
                <div className="space-y-4 p-4 pt-0 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Link href={getHref()} className="flex items-center gap-2">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Trace ID:
                      </div>
                      <div className="flex items-center gap-1 truncate text-xs text-gray-600 dark:text-gray-400">
                        {traceId}
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-5 w-5 p-0"
                          onClick={(e) => handleCopy(e, traceId)}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </Link>
                    <Link
                      href={`/localhost/traces?traceId=${traceId}&spanId=${spanId}`}
                      className="flex items-center gap-2"
                    >
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Span ID:
                      </div>
                      <div className="flex items-center gap-1 truncate text-xs text-gray-600 dark:text-gray-400">
                        {spanId}
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-5 w-5 p-0"
                          onClick={(e) => handleCopy(e, spanId)}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </Link>
                  </div>

                  {/* Resource Attributes */}
                  <div className="border-t pt-3">
                    <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                      Resource Attributes
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {span.resource?.attributes.length === 0 && (
                        <div className="text-xs text-gray-500">
                          No resource attributes
                        </div>
                      )}
                      {span.resource?.attributes.map((kv, kvIndex) => (
                        <Tooltip
                          key={`${traceId}-${spanId}-resource-${kvIndex}`}
                        >
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="flex cursor-pointer items-center gap-1 border-gray-200 bg-gray-50 dark:bg-gray-800"
                            >
                              <span className="font-mono text-xs">
                                {kv.key}={kv.value?.kind.value?.toString()}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="w-72">
                            <div className="space-y-1.5">
                              <KeyValueRow
                                label="Key"
                                value={"resource['" + kv.key + "']"}
                              />
                              <KeyValueRow
                                label="Type"
                                value={kv.value?.kind.case?.toString() ?? ""}
                              />
                              <KeyValueRow
                                label="Value"
                                value={kv.value?.kind.value?.toString() ?? ""}
                              />
                              <div className="mt-2 border-t border-gray-200 pt-2" />
                              <FilterByKeyValue
                                symbolName={newIndexorExpr(
                                  newIdentifierExpr("resource"),
                                  newLiteralExpr(newStrVal(kv.key)),
                                )}
                                symbolValue={newLiteralExpr(kv.value!)}
                                symbolCase={kv.value?.kind.case}
                              />
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Span Attributes */}
                  <div className="border-t pt-3">
                    <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                      Span Attributes
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {span.attributes.length === 0 && (
                        <div className="text-xs text-gray-500">
                          No span attributes
                        </div>
                      )}
                      {span.attributes.map((kv, kvIndex) => (
                        <Tooltip key={`${traceId}-${spanId}-attr-${kvIndex}`}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="flex cursor-pointer items-center gap-1 border-gray-200 bg-gray-50 dark:bg-gray-800"
                            >
                              <span className="font-mono text-xs">
                                {kv.key}={kv.value?.kind.value?.toString()}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="w-72">
                            <div className="space-y-1.5">
                              <KeyValueRow
                                label="Key"
                                value={"attributes['" + kv.key + "']"}
                              />
                              <KeyValueRow
                                label="Type"
                                value={kv.value?.kind.case?.toString() ?? ""}
                              />
                              <KeyValueRow
                                label="Value"
                                value={kv.value?.kind.value?.toString() ?? ""}
                              />
                              <div className="mt-2 border-t border-gray-200 pt-2" />
                              <FilterByKeyValue
                                symbolName={newIndexorExpr(
                                  newIdentifierExpr("attributes"),
                                  newLiteralExpr(newStrVal(kv.key)),
                                )}
                                symbolValue={newLiteralExpr(kv.value!)}
                                symbolCase={kv.value?.kind.case}
                              />
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
});

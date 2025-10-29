import { SpanTreeNode } from "@/components/traces/utils";
import { AlertCircle, Hash } from "lucide-react";
import { formatTimestamp, formatDuration } from "@/lib/utils/format-timestamp";
import { spanIdToString } from "@/lib/utils/id-factories";

interface SpanInfo {
  node: SpanTreeNode;
  serviceColors: { [key: string]: string };
}

export const SpanInfo = ({ node, serviceColors }: SpanInfo) => {
  return (
    <div className="bg-background fixed top-32 bottom-0 w-full overflow-y-auto rounded-r-lg border-l p-4">
      {/* Header */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <div
          className="text-lg font-semibold"
          style={{ color: serviceColors[node.span.serviceName] }}
        >
          {node.span.serviceName}
        </div>
        <div className="text-base font-medium text-gray-700 dark:text-gray-200">
          {node.span.name}
        </div>
      </div>

      {/* Span ID */}
      <div className="mb-4 border-b px-2 pb-4">
        <div className="mb-1 flex items-center font-medium">
          <Hash size={16} className="mr-1" />
          <span>Span ID</span>
        </div>
        <div className="mt-1 rounded px-2 py-1 font-mono text-sm">
          {spanIdToString(node.span.spanId)}
        </div>
      </div>

      {/* Timing Information */}
      <div className="mb-4 space-y-3 border-b px-2 pb-4">
        {/* Start Time */}
        {node.span.time && (
          <div>
            <div className="mb-1 flex items-center font-medium">
              <span>Start Time</span>
            </div>
            <div className="mt-1 space-y-1">
              <div className="rounded bg-gray-50 px-2 py-1 font-mono text-sm dark:bg-gray-800">
                {formatTimestamp(node.span.time)}
              </div>
            </div>
          </div>
        )}

        {/* Duration */}
        {node.span.duration && (
          <div>
            <div className="mb-1 flex items-center font-medium">
              <span>Duration</span>
            </div>
            <div className="mt-1 rounded bg-gray-50 px-2 py-1 font-mono text-sm dark:bg-gray-800">
              {formatDuration(node.span.duration)}
            </div>
          </div>
        )}
      </div>

      {/* Resource Attributes */}
      <div className="mb-4 border-b px-2 pb-4">
        <div className="u mb-1 flex items-center font-medium">
          <span>Resource Attributes</span>
        </div>
        <div>
          {node.span.resource?.attributes &&
          node.span.resource.attributes.length > 0 ? (
            node.span.resource?.attributes?.map((attr, i) => (
              <div key={`${i}-${attr.key}`} className="py-1">
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  {attr.key}
                </div>

                <div className="text-sm">
                  {attr.value?.kind.value?.toString() || "null"}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-2 text-sm text-gray-400 dark:text-gray-400">
              <AlertCircle size={14} className="mr-1" />
              <span>No resource attributes</span>
            </div>
          )}
        </div>
      </div>

      {/* Span Attributes */}
      <div className="px-2">
        <div className="mb-1 flex items-center font-medium">
          <span>Span Attributes</span>
        </div>
        <div>
          {node.span.attributes.length > 0 ? (
            node.span.attributes.map((attr, i) => (
              <div key={`${i}-${attr.key}`} className="py-1">
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  {attr.key}
                </div>

                <div className="text-sm">
                  {attr.value?.kind.value?.toString() || "null"}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-2 text-sm text-gray-400 dark:text-gray-400">
              <AlertCircle size={14} className="mr-1" />
              <span>No resource attributes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { Data, LogEvents, Spans, Tabular } from "api/js/types/v1/data_pb";
import { Table } from "api/js/types/v1/types_pb";

export const onTabularData = (
  data: Data | undefined,
  handler: (tabular: LogEvents | Table | Spans | undefined) => void,
) => {
  if (!data) return;
  if (data.shape.case !== "tabular") return;
  handler(data.shape.value.shape.value);
};

/**
 * Extract data from stream responses based on the shape case.
 *
 * @param streamRes - Array of stream responses to process
 * @param shapeCase - The shape case to filter for (e.g., 'spans', 'logEvents', 'freeForm')
 * @param extractFn - Function to extract the specific data from the matching shape value
 * @returns The extracted data array or undefined if no matching data
 */
export function extractFromStreamResponses<T, R>(
  streamRes: StreamResponse[] | undefined,
  extractFn: (value: any) => T[],
): T[] {
  if (!streamRes) return [];

  const results: T[] = [];

  streamRes.forEach((res) => {
    onTabularData(res.data, (tabular) => {
      const extracted = extractFn(tabular);
      results.push(...extracted);
    });
  });

  return results;
}

/**
 * Get shape case and value from a stream response or data
 *
 * @param streamRes - Optional array of stream responses
 * @param data - Optional data object
 * @returns Object containing the dataCase and value
 */
export function getShapeFromResponse(
  streamRes?: StreamResponse[],
  data?: Data,
): { dataCase: string | undefined; value: any } {
  if (streamRes && streamRes[0]) {
    return {
      dataCase: streamRes[0]?.data?.shape?.case,
      value: streamRes[0]?.data?.shape?.value,
    };
  } else if (data?.shape) {
    return {
      dataCase: data.shape.case,
      value: data.shape.value,
    };
  }

  return { dataCase: undefined, value: undefined };
}

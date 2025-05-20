import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { Data } from "api/js/types/v1/data_pb";
import { Dispatch, SetStateAction } from "react";

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
  shapeCase: string,
  extractFn: (value: any) => T[],
): T[] {
  if (!streamRes) return [];

  const results: T[] = [];

  streamRes.forEach((res) => {
    if (res.data?.shape.case === "tabular") {
      const { value } = res.data.shape;
      if (value.shape.value && value.shape.case === shapeCase) {
        const extracted = extractFn(value.shape.value);
        results.push(...extracted);
      }
    }
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

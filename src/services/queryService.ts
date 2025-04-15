import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { QueryService } from "api/js/svc/query/v1/service_connect";
import { FormatRequest } from "api/js/svc/query/v1/service_pb";

type QueryClientType = Client<typeof QueryService>;

export const parseQuery = async <T>(
  queryClient: QueryClientType,
  parseReq: { query: string },
  callbacks?: CallbacksType<T>,
) => {
  try {
    const parsedQuery = await queryClient.parse(parseReq);
    callbacks?.onSuccess?.(parsedQuery as T);
    return parsedQuery;
  } catch (error) {
    handleError<T>(error, callbacks);
  }
};

export const formatQuery = async <T>(
  queryClient: QueryClientType,
  formatReq: FormatRequest,
  callbacks?: CallbacksType<T>,
) => {
  try {
    const { formatted } = await queryClient.format(formatReq);
    callbacks?.onSuccess?.(formatted as T);
    return formatted;
  } catch (error) {
    handleError<T>(error, callbacks);
  }
};

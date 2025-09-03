import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { QueryService } from "api/js/svc/query/v1/service_pb";
import {
  FormatRequest,
  QueryRequest,
  StreamRequest,
  StreamResponse,
  ParseResponse,
} from "api/js/svc/query/v1/service_pb";

export type QueryClientType = Client<typeof QueryService>;

export const parseQuery = async (
  queryClient: QueryClientType,
  parseReq: { query: string },
  callbacks?: CallbacksType<ParseResponse>,
) => {
  try {
    const parseRes = await queryClient.parse(parseReq);
    callbacks?.onSuccess?.(parseRes as ParseResponse);
    return parseRes;
  } catch (error) {
    handleError<ParseResponse>(error, callbacks);
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

export const getQuery = async <T>(
  queryClient: QueryClientType,
  queryReq: QueryRequest,
  callbacks?: CallbacksType<T>,
) => {
  try {
    const queryRes = await queryClient.query(queryReq);
    callbacks?.onSuccess?.(queryRes as T);
    return queryRes;
  } catch (error) {
    handleError<T>(error, callbacks);
  }
};

export const getStream = (
  queryClient: QueryClientType,
  streamReq: StreamRequest,
  callbacks?: CallbacksType<StreamResponse>,
) => {
  try {
    const stream = queryClient.stream(streamReq);

    const processStream = async () => {
      try {
        for await (const res of stream) {
          callbacks?.onSuccess?.(res);
        }
      } catch (error) {
        handleError<StreamResponse>(error, callbacks);
      }
    };

    processStream();

    return stream;
  } catch (error) {
    handleError<StreamResponse>(error, callbacks);
  }
};

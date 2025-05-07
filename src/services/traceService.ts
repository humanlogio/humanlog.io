import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { TraceService } from "api/js/svc/query/v1/trace_service_connect";
import {
  GetSpanResponse,
  GetTraceResponse,
} from "api/js/svc/query/v1/trace_service_pb";

type TraceClientType = Client<typeof TraceService>;

export const getTrace = async (
  traceClient: TraceClientType,
  traceId: string,

  callbacks?: CallbacksType<GetTraceResponse>,
) => {
  try {
    const res = await traceClient.getTrace({
      by: {
        case: "traceId",
        value: traceId,
      },
    });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<GetTraceResponse>(error, callbacks);
  }
};

export const getSpan = async (
  traceClient: TraceClientType,
  spanId: string,
  callbacks?: CallbacksType<GetSpanResponse>,
) => {
  try {
    const res = await traceClient.getSpan({
      spanId,
    });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<GetSpanResponse>(error, callbacks);
  }
};

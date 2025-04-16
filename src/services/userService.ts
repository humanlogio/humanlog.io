import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { UserService } from "api/js/svc/user/v1/service_connect";
import { LogQuery } from "api/js/types/v1/logquery_pb";

type UserClientType = Client<typeof UserService>;

export const recordQueryHistory = async <T>(
  userClient: UserClientType,
  rawQuery: string,
  query: LogQuery,
  callbacks?: CallbacksType<T>,
) => {
  try {
    const res = await userClient.recordQueryHistory({
      rawQuery,
      query,
    });
    callbacks?.onSuccess?.(res as T);
    return res;
  } catch (error) {
    handleError<T>(error, callbacks);
  }
};

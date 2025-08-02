import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { UserService } from "api/js/svc/user/v1/service_private_connect";
import {
  GetQueryHistoryResponse,
  UpdateUserResponse,
  WhoamiResponse,
} from "api/js/svc/user/v1/service_private_pb";
import { Query } from "api/js/types/v1/query_pb";

type UserClientType = Client<typeof UserService>;

export const recordQueryHistory = async <T>(
  userClient: UserClientType,
  rawQuery: string,
  query: Query,
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

export const getQueryHistory = async (
  userClient: UserClientType,
  id: bigint,
  callbacks?: CallbacksType<GetQueryHistoryResponse>,
) => {
  try {
    const res = await userClient.getQueryHistory({
      id,
    });
    callbacks?.onSuccess?.(res);
    return res;
  } catch (error) {
    handleError<GetQueryHistoryResponse>(error, callbacks);
  }
};

export const getWhoami = async (
  userClient: UserClientType,
  callbacks?: CallbacksType<WhoamiResponse>,
) => {
  try {
    const res = await userClient.whoami({});
    callbacks?.onSuccess?.(res);
    return res;
  } catch (error) {
    handleError<WhoamiResponse>(error, callbacks);
  }
};

export const updateUser = async (
  userClient: UserClientType,
  firstName?: string,
  lastName?: string,
  username?: string,
  callbacks?: CallbacksType<UpdateUserResponse>,
) => {
  try {
    const res = await userClient.updateUser({ firstName, lastName, username });
    callbacks?.onSuccess?.(res);
    return res;
  } catch (error) {
    handleError<UpdateUserResponse>(error, callbacks);
  }
};

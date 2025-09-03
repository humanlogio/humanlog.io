import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import {
  PublicShareService,
  UserShareService,
} from "api/js/svc/share/v1/service_pb";
import {
  CreateUserSharedResultResponse,
  DeleteUserSharedResultResponse,
  GetUserSharedResultResponse,
  ListSharedResultResponse,
  ListUserSharedResultResponse,
  UpdateUserSharedResultResponse,
  ViewSharedResultResponse,
} from "api/js/svc/share/v1/service_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Data } from "api/js/types/v1/data_pb";
import { SharedResultVisibility } from "api/js/types/v1/shared_result_pb";
import { User } from "api/js/types/v1/user_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";

type UserShareClientType = Client<typeof UserShareService>;
type PublicShareClientType = Client<typeof PublicShareService>;

export const createUserSharedResult = async (
  userShareClient: UserShareClientType,
  query?: QueryHistoryEntry,
  result?: Data,
  visibility?: SharedResultVisibility,
  callbacks?: CallbacksType<CreateUserSharedResultResponse>,
) => {
  try {
    const res = await userShareClient.createUserSharedResult({
      query,
      result,
      visibility,
    });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<CreateUserSharedResultResponse>(error, callbacks);
  }
};

export const getUserSharedResult = async (
  userShareClient: UserShareClientType,
  id: bigint,
  callbacks?: CallbacksType<GetUserSharedResultResponse>,
) => {
  try {
    const res = await userShareClient.getUserSharedResult({ id });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<GetUserSharedResultResponse>(error, callbacks);
  }
};

export const getListUserSharedResult = async (
  userShareClient: UserShareClientType,
  limit: number,
  cursor?: Cursor,
  callbacks?: CallbacksType<ListUserSharedResultResponse>,
) => {
  try {
    const res = await userShareClient.listUserSharedResult({ limit, cursor });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<ListUserSharedResultResponse>(error, callbacks);
  }
};

export const updateUserSharedResult = async (
  userShareClient: UserShareClientType,
  id: bigint,
  visibility?: SharedResultVisibility,
  callbacks?: CallbacksType<UpdateUserSharedResultResponse>,
) => {
  try {
    const res = await userShareClient.updateUserSharedResult({
      id,
      visibility,
    });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<UpdateUserSharedResultResponse>(error, callbacks);
  }
};

export const deleteUserSharedResult = async (
  userShareClient: UserShareClientType,
  id: bigint,
  callbacks?: CallbacksType<DeleteUserSharedResultResponse>,
) => {
  try {
    const res = await userShareClient.deleteUserSharedResult({ id });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<DeleteUserSharedResultResponse>(error, callbacks);
  }
};

export const getPublicSharedResult = async (
  publicShareClient: PublicShareClientType,
  shareId: string,
  randomPrefix?: string,
  callbacks?: CallbacksType<ViewSharedResultResponse>,
) => {
  try {
    const res = await publicShareClient.viewSharedResult({
      shareId,
      ...(randomPrefix && { randomPrefix }),
    });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<ViewSharedResultResponse>(error, callbacks);
  }
};

export const getPublicListSharedResult = async (
  publicShareClient: PublicShareClientType,
  sharedBy: User,
  limit: number,
  cursor?: Cursor,
  callbacks?: CallbacksType<ListSharedResultResponse>,
) => {
  try {
    const res = await publicShareClient.listSharedResult({
      sharedBy,
      limit,
      cursor,
    });
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<ListSharedResultResponse>(error, callbacks);
  }
};

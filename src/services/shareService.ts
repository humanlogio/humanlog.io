import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import {
  PublicShareService,
  UserShareService,
} from "api/js/svc/share/v1/service_connect";
import { CreateUserSharedResultResponse } from "api/js/svc/share/v1/service_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Data } from "api/js/types/v1/data_pb";
import { SharedResultVisibility } from "api/js/types/v1/shared_result_pb";

type UserShareClientType = Client<typeof UserShareService>;

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

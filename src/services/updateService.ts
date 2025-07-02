import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { UpdateService } from "api/js/svc/cliupdate/v1/service_connect";
import {
  GetNextUpdateRequest,
  GetNextUpdateResponse,
} from "api/js/svc/cliupdate/v1/service_pb";

export type UpdateClientType = Client<typeof UpdateService>;

export const getNextUpdate = async (
  updateClient: UpdateClientType,
  request: GetNextUpdateRequest,
  callbacks?: CallbacksType<GetNextUpdateResponse>,
) => {
  try {
    const res = await updateClient.getNextUpdate(request);
    callbacks?.onSuccess?.(res);
    return res;
  } catch (error) {
    handleError(error, callbacks);
  }
};

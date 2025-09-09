import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { FeatureService } from "api/js/svc/feature/v1/service_pb";

type FeatureClientType = Client<typeof FeatureService>;

export const getListFeature = async <T>(
  featureClient: FeatureClientType,
  callbacks?: CallbacksType<T>,
) => {
  try {
    const res = await featureClient.listFeature({});
    callbacks?.onSuccess?.(res as T);
    return res;
  } catch (error) {
    handleError<T>(error, callbacks);
  }
};

export const getAllowedUsage = async <T>(
  featureClient: FeatureClientType,
  callbacks?: CallbacksType<T>,
) => {
  try {
    const res = await featureClient.allowedUsage({});
    callbacks?.onSuccess?.(res as T);
    return res;
  } catch (error) {
    handleError<T>(error, callbacks);
  }
};

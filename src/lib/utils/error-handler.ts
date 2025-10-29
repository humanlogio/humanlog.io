import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";

export type CallbacksType<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: ConnectError) => void;
};

export const handleError = <T>(
  error: any,
  callbacks?: CallbacksType<T>,
  showToast: boolean = true,
) => {
  if (error instanceof ConnectError) {
    callbacks?.onError?.(error);
    console.error(error);
    if (showToast) {
      toast.error(error.message);
    }
  }
};

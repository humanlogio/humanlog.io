import { useQuery } from "@connectrpc/connect-query";
import { whoami } from "api/js/svc/user/v1/service_private-UserService_connectquery";

export const useUser = () => {
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    refetch: refetchUser,
  } = useQuery(
    whoami,
    {},
    {
      staleTime: 60 * 60 * 1000, // 1 hour
    },
  );

  return {
    userData: isErrorUser ? undefined : userData,
    isLoadingUser,
    refetchUser,
  };
};

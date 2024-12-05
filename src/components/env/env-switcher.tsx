"use client";

import { ReactNode } from "react";
import { useApiClients } from "@/context/api-provider";
import { useRouter } from "next/router";
import { getEnvironment } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { useQuery, useSuspenseQuery } from "@connectrpc/connect-query";
import { Loader } from "lucide-react";

const EnvSwitcher = ({
  env,
  children,
}: {
  env?: string;
  children: ReactNode;
}) => {
  const { setActiveEnvironment } = useApiClients();
  const router = useRouter();

  const { data, error, isFetching } = useSuspenseQuery(
    getEnvironment,
    env
      ? {
          by: {
            value: env,
            case: "name",
          },
        }
      : {},
  );

  if (!env) {
    return children;
  }

  if (isFetching) {
    return <Loader className="animate-spin" />;
  }

  if (error || !data?.environment?.id) {
    router.push("/");
    return (
      <div className="flex flex-col gap-4">
        <Loader className="animate-spin" />
        Redirecting...
      </div>
    );
  }

  setActiveEnvironment(data.environment.id);

  return children;
};

export default EnvSwitcher;

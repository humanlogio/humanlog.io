"use client";

import { ReactNode, useEffect } from "react";
import { useApiClients } from "@/context/api-provider";
import { useRouter } from "next/navigation";
import { getEnvironment } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { useSuspenseQuery } from "@connectrpc/connect-query";
import { Loader } from "lucide-react";

const EnvSwitcher = ({
  env,
  children,
}: {
  env: string;
  children: ReactNode;
}) => {
  const { setActiveEnvironment } = useApiClients();
  const router = useRouter();

  const { data, error, isFetching } = useSuspenseQuery(getEnvironment, {
    by: {
      value: env,
      case: "name",
    },
  });

  useEffect(() => {
    if (data.environment) {
      setActiveEnvironment(data.environment);
    }
  }, []);

  if (isFetching) {
    return <Loader className="animate-spin" />;
  }

  if (error || !data?.environment?.id) {
    // todo maybe throw error?
    router.push("/");
    return (
      <div className="flex flex-col gap-4">
        <Loader className="animate-spin" />
        Redirecting...
      </div>
    );
  }

  return children;
};

export default EnvSwitcher;

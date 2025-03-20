import { useApiClients } from "@/context/api-provider";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronRight } from "lucide-react";
import { ListQueryHistoryResponse_ListItem } from "api/js/svc/user/v1/service_pb";

// dayjs에 relativeTime 플러그인 추가
dayjs.extend(relativeTime);

export const SavedQuery = () => {
  const { apiClients } = useApiClients();
  const [queryHistory, setQueryHistory] =
    useState<ListQueryHistoryResponse_ListItem[]>();

  return <div>saved query</div>;
};

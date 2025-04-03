"use client";

import { useApiClients } from "@/context/api-provider";
import { QueryRequest } from "api/js/svc/query/v1/service_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { Tabular } from "api/js/types/v1/query_pb";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export const useInfiniteQuery = (query?: LogQuery | undefined) => {
  const limit = 100;

  const { apiClients, activeEnvironment } = useApiClients();
  const [isFetching, setIsFetching] = useState(false);
  const [next, setNext] = useState<Cursor | null>();

  const { ref: targetRef, inView: fetchNext } = useInView();

  const fetchData = async (callback?: (res: any) => void) => {
    try {
      setIsFetching(true);
      const queryReq = new QueryRequest({
        environmentId: activeEnvironment?.id,
        query,
        ...(next && { cursor: next }),
        limit,
      });

      const queryRes = await apiClients?.query.query(queryReq);

      if (queryRes?.data) {
        const { case: shapeCase, value } = queryRes.data.shape;
        if (shapeCase === "tabular" && value instanceof Tabular) {
          callback?.(value.shape);
        }
      }
      setNext(queryRes?.next ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  return { targetRef, isFetching, fetchNext, fetchData, next, setNext };
};

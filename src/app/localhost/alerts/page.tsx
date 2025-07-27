import { useQuery } from "@connectrpc/connect-query";
import { listAlertGroup } from "api/js/svc/alert/v1/service-AlertService_connectquery";

interface AlertsProps {
  stackName: string;
}

export default function Alerts({ stackName }: AlertsProps) {
  const { isLoading, data: alertGroupList } = useQuery(listAlertGroup, {
    stackName: stackName,
  });

  if (isLoading) {
    return <div>Loading alert groups</div>;
  }
  if (!alertGroupList) {
    return <div>No alert groups found</div>;
  }

  return (
    <div>
      {alertGroupList.items.map((li) => {
        const ag = li.alertGroup!;
        return (
          <div>
            <div>Name: {ag?.name}</div>
            <div>Interval: {ag?.interval?.toJsonString()}</div>
            <div>Limit: {ag?.limit?.toLocaleString()}</div>
            <div>Labels: {ag?.labels?.toJsonString()}</div>
            <div>Query Offset: {ag?.queryOffset?.toJsonString()}</div>
            <div>
              Rules:
              <div>
                {ag.rules.map((rule) => {
                  return (
                    <>
                      <div>Name: {rule.name}</div>
                      <div>Expr: {rule.expr?.toJsonString()}</div>
                      <div>Labels: {rule.labels?.toJsonString()}</div>
                      <div>Annotations: {rule.annotations?.toJsonString()}</div>
                      <div>For: {rule.for?.toJsonString()}</div>
                      <div>
                        Keep Firing For: {rule.keepFiringFor?.toJsonString()}
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  BarChart,
  Bar,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from "recharts";
import DateRangePicker from "@/components/ui/graph/dateRangePicker";
import { useApiClients } from "@/context/api-provider";
import {
  convertToGraphDataPoints,
  convertToTimestamp,
} from "@/components/env/graph-utils";

type DataPoint = {
  dayNumber: number;
  date: Date;
  amt: number;
  pv?: number;
};

type IntervalType = "minute" | "hour" | "day" | "week" | "month";

type ZoomType = {
  startIndex: number;
  endIndex: number;
};

interface LogGraphProps {
  getTimeRange: (from: Date, to: Date) => void;
}

export const LogGraph = ({ getTimeRange }: LogGraphProps) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const { apiClients, activeEnvironment } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
  );
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().valueOf()));
  const [bucketCount, setBucketCount] = useState(100);
  const [intervalType, setIntervalType] = useState<IntervalType>("day");
  const [focusedDate, setFocusedDate] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const [graphRange, setGraphRange] = useState<{
    startIndex: number;
    endIndex: number;
  }>({
    startIndex: 0,
    endIndex: eventsList?.length ? eventsList.length - 1 : 0,
  });

  const updateGraphRange = useCallback(() => {
    (async () => {
      try {
        const events = await apiClients?.query.summarizeEvents({
          environmentId: activeEnvironment?.id,
          from: convertToTimestamp(startDate),
          to: convertToTimestamp(endDate),
          bucketCount,
        });
        if (events) {
          setEvents(
            convertToGraphDataPoints(events.buckets, startDate, endDate),
          );
        }
      } catch (e) {
        console.log("it crashed", e);
      }
    })();
  }, [apiClients?.query, activeEnvironment?.id, startDate, endDate]);

  // 날짜 범위에 따른 적절한 간격 유형과 버킷 수 자동 계산
  const calculateOptimalBucket = useCallback(() => {
    if (!startDate || !endDate) return;

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let newBucketCount: number;
    let newIntervalType: IntervalType;

    if (diffDays <= 1) {
      // 1일 이하: 시간 간격
      newBucketCount = 24; // 1시간 간격
      newIntervalType = "hour";
    } else if (diffDays <= 7) {
      // 1주일 이하: 3시간 ~ 12시간 간격
      newBucketCount = Math.min(56, Math.max(14, Math.round(diffDays * 8)));
      newIntervalType = "hour";
    } else if (diffDays <= 31) {
      // 1달 이하: 일 간격
      newBucketCount = Math.round(diffDays);
      newIntervalType = "day";
    } else if (diffDays <= 90) {
      // 3달 이하: 일~주 간격
      newBucketCount = Math.min(90, Math.max(30, Math.round(diffDays / 2)));
      newIntervalType = "day";
    } else {
      // 3달 초과: 주~월 간격
      newBucketCount = Math.min(100, Math.max(30, Math.round(diffDays / 7)));
      newIntervalType = "week";
    }

    setBucketCount(newBucketCount);
    setIntervalType(newIntervalType);
  }, [startDate, endDate]);

  // 날짜 범위 변경 시 최적의 버킷 계산
  useEffect(() => {
    calculateOptimalBucket();
  }, [startDate, endDate, calculateOptimalBucket]);

  // 바 클릭 핸들러 구현
  const handleBarClick = (data: DataPoint) => {
    const clickedDate = new Date(data.date);

    // 현재 간격 유형에 따라 포커스 범위 결정
    let focusStart = new Date(clickedDate);
    let focusEnd = new Date(clickedDate);

    switch (intervalType) {
      case "minute":
        focusStart.setSeconds(0, 0);
        focusEnd = new Date(focusStart);
        focusEnd.setMinutes(focusStart.getMinutes() + 1);
        break;
      case "hour":
        focusStart.setMinutes(0, 0, 0);
        focusEnd = new Date(focusStart);
        focusEnd.setHours(focusStart.getHours() + 1);
        break;
      case "day":
        focusStart.setHours(0, 0, 0, 0);
        focusEnd = new Date(focusStart);
        focusEnd.setDate(focusStart.getDate() + 1);
        break;
      case "week":
        const day = focusStart.getDay();
        const diff = focusStart.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작 기준
        focusStart = new Date(focusStart.setDate(diff));
        focusStart.setHours(0, 0, 0, 0);

        focusEnd = new Date(focusStart);
        focusEnd.setDate(focusStart.getDate() + 7);
        break;
      case "month":
        focusStart.setDate(1);
        focusStart.setHours(0, 0, 0, 0);

        focusEnd = new Date(focusStart);
        focusEnd.setMonth(focusStart.getMonth() + 1);
        break;
    }

    // 종료 시간에서 1ms 빼서 정확한 범위 유지 (23:59:59.999)
    focusEnd = new Date(focusEnd.getTime() - 1);

    setFocusedDate({ start: focusStart, end: focusEnd });
    getTimeRange(focusStart, focusEnd);

    // 여기서 필요한 경우 쿼리 에디터에 시간 필터를 추가할 수 있습니다
    // addTimeFilter(`timestamp >= "${formatDate(focusStart)}" AND timestamp <= "${formatDate(focusEnd)}"`);
  };

  // 포커스 모드 해제
  const clearFocus = () => {
    setFocusedDate(null);
    // 쿼리에서 추가된 시간 필터 제거
    // removeTimeFilter();
  };

  const updateGraph = (brushState: ZoomType) => {
    if (
      eventsList &&
      brushState.startIndex !== undefined &&
      brushState.endIndex !== undefined
    ) {
      setGraphRange({
        startIndex: brushState.startIndex,
        endIndex: brushState.endIndex,
      });

      // 선택된 범위의 날짜 계산
      const newStartDate = eventsList[brushState.startIndex].date;
      const newEndDate = eventsList[brushState.endIndex].date;

      // 날짜 범위를 업데이트하지 않고 그래프 범위만 조정하려면 아래 부분은 주석 처리
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  };

  useEffect(() => {
    updateGraphRange();
  }, [startDate, endDate]);

  useEffect(() => {
    if (focusedDate) {
      getTimeRange(focusedDate.start, focusedDate.end);
      return;
    }

    getTimeRange(startDate, endDate);
  }, [startDate, endDate, focusedDate]);

  if (!eventsList) return;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-1 ml-auto text-xs text-gray-500">
        Interval: {intervalType} (buckets: {bucketCount})
      </div>

      <div className="mt-2 h-48 w-full">
        {eventsList.length === 0 ? (
          <div className="w-full">
            <p className="mt-1 rounded-md border bg-slate-200 p-4 text-sm leading-tight font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              No log data was found for that time frame.
              <br />
              <br />
              Try expanding the date range. If still no data is coming through,
              please check that the log source is configured correctly.
            </p>
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={eventsList}
              onClick={(e) =>
                e.activePayload && handleBarClick(e.activePayload[0].payload)
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                domain={[startDate.getTime(), endDate.getTime()]}
                type="number"
                scale="time"
                tickFormatter={(timestamp) => dayjs(timestamp).format("MM/DD")}
              />
              <YAxis width={40} />
              <Tooltip
                labelClassName="text-xs text-white dark:text-muted-foreground"
                contentStyle={{
                  background: "currentColor",
                  fontSize: "0.75rem",
                }}
              />
              <Bar
                type="monotone"
                dataKey="amt"
                name="Log Amount"
                stroke="#4d80e6"
                fill="#4d80e6"
                // stroke="rgba(136, 170, 238, var(--tw-bg-opacity))"
                // fill="rgba(136, 170, 238, var(--tw-bg-opacity))"
                // isAnimationActive={activeAnimations}
              >
                {eventsList.map((entry, i) => {
                  if (!focusedDate)
                    return (
                      <Cell
                        key={`cell-${i}`}
                        fillOpacity={0.5}
                        strokeOpacity={0.5}
                        fill="#4d80e6"
                      />
                    );

                  const barDate = new Date(entry.date);
                  const isFocused =
                    barDate >= focusedDate.start && barDate <= focusedDate.end;

                  return (
                    <Cell
                      key={`cell-${i}`}
                      fillOpacity={isFocused ? 1 : 0.5}
                      strokeOpacity={isFocused ? 1 : 0.5}
                      stroke="#4d80e6"
                      fill="#4d80e6"
                    />
                  );
                })}
              </Bar>
              {/* <Brush
                dataKey="date" // x축 데이터 키
                height={16} // 브러시 높이
                stroke="rgba(24, 106, 188, 0.6)" // 브러시 테두리 색상
                fill="rgba(136, 170, 238, 0.3)" // 브러시 내부 색상
                gap={1} // 바 차트 간격
                onChange={(brushState) => updateGraph(brushState)} // 브러시 변경 시 호출될 함수
                startIndex={0} // 초기 선택 시작 인덱스
                endIndex={eventsList.length - 1} // 초기 선택 끝 인덱스
                travellerWidth={10} // 드래그 핸들 너비
                tickFormatter={(timestamp) => dayjs(timestamp).format("MM/DD")} // 눈금 포맷팅
              /> */}
              {/* {focusedDate && (
                <ReferenceArea
                  x1={focusedDate.start.getTime()}
                  x2={focusedDate.end.getTime()}
                  strokeOpacity={0.3}
                  fill="black"
                  fillOpacity={0.3}
                />
              )} */}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* 포커스 모드 표시 */}
      {focusedDate && (
        <div className="mb-2 w-full rounded-md bg-blue-50 p-2 text-sm dark:bg-blue-900/30">
          <div className="flex items-center justify-between">
            <span>
              <span className="font-semibold">Focused on:</span>{" "}
              {dayjs(focusedDate.start).format("YYYY-MM-DD HH:mm")} to{" "}
              {dayjs(focusedDate.end).format("YYYY-MM-DD HH:mm")}
              {intervalType !== "minute" &&
                intervalType !== "hour" &&
                ` (${intervalType})`}
            </span>
            <button
              onClick={clearFocus}
              className="rounded bg-blue-100 px-2 py-1 text-xs hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700"
            >
              Clear focus
            </button>
          </div>
        </div>
      )}
      <DateRangePicker
        dateFrom={startDate}
        dateTo={endDate}
        setDateFrom={setStartDate}
        setDateTo={setEndDate}
        // onChanage={() => handleDateRangeChange(startDate, endDate)}
      />
    </div>
  );
};

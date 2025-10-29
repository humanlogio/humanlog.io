import { Arr, Table, TableType_Column } from "api/js/types/v1/types_pb";
import { useEffect, useState, useMemo, useRef } from "react";
import { formatTimestamp } from "@/lib/utils/format-timestamp";
import { Loader } from "lucide-react";
import * as d3 from "d3";
import { Data } from "api/js/types/v1/data_pb";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistogramProps {
  data?: Table;
  tableColumns?: TableType_Column[];
  tableRows?: Arr[];
  loading?: boolean;
}

interface HistogramDataPoint {
  timestamp: string;
  formattedTime: string;
  bucket: number;
  count: number;
}

interface ProcessedData {
  timePoints: string[];
  bucketValues: number[];
  heatmapData: HistogramDataPoint[];
  maxCount: number;
}

interface Cell {
  bucket: number;
  time: string;
  count: number;
  x: number;
  y: number;
}

export default function Histogram({
  data,
  tableColumns,
  tableRows,
  loading,
}: HistogramProps) {
  const [timeColumns, setTimeColumns] = useState<string[]>([]);
  const [items, setItems] = useState<Arr[]>([]);
  const [tooltipData, setTooltipData] = useState<Cell[] | null>(null);
  const [hoveredCell, setHoveredCell] = useState<Cell | null>(null);
  const [sharedData, setSharedData] = useState<Data | null>(null);
  const [colorTheme, setColorTheme] = useState<
    "spectral" | "blues" | "reds" | "viridis" | "plasma"
  >("spectral");

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const processedData = useMemo<ProcessedData>(() => {
    try {
      const histogramPoints: HistogramDataPoint[] = [];

      tableRows?.forEach((item, i) => {
        let timestamp = "";
        let formattedTime = timeColumns[i] || "";

        if (item.items[0]?.kind.case === "ts") {
          timestamp = formatTimestamp(item.items[0]?.kind.value);
        }

        if (item.items[1]?.kind.case === "map") {
          const entries = item.items[1].kind.value.entries;

          entries.forEach((entry) => {
            let bucket = 0;
            let count = 0;

            if (entry.key?.kind.case === "i64") {
              bucket = Number(entry.key.kind.value);
            }

            if (entry.value?.kind.case === "i64") {
              count = Number(entry.value.kind.value);
            }

            histogramPoints.push({
              timestamp,
              formattedTime,
              bucket,
              count,
            });
          });
        }
      });

      const timePoints = [
        ...new Set(histogramPoints.map((point) => point.formattedTime)),
      ];

      const bucketValues = [
        ...new Set(histogramPoints.map((point) => point.bucket)),
      ].sort((a, b) => b - a);

      const maxCount = Math.max(
        ...histogramPoints.map((point) => point.count),
        1,
      );

      return {
        timePoints,
        bucketValues,
        heatmapData: histogramPoints,
        maxCount,
      };
    } catch (error) {
      return { timePoints: [], bucketValues: [], heatmapData: [], maxCount: 0 };
    }
  }, [items, timeColumns]);

  useEffect(() => {
    try {
      if (tableRows) {
        const loadedItems: Arr[] = tableRows;

        const timeColumns: string[] = [];
        loadedItems.forEach((item) => {
          item.items.forEach((val) => {
            if (val.kind.case === "ts") {
              timeColumns.push(formatTimestamp(val.kind.value));
            }
          });
        });

        setTimeColumns(timeColumns);
        setItems(loadedItems);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    if (loading || !svgRef.current || processedData.heatmapData.length === 0)
      return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 0, right: 50, bottom: 0, left: 30 };
    const width = Math.max(700, processedData.timePoints.length * 20);
    const height = 400;

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
      )
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(processedData.timePoints)
      .range([0, width]);
    // .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(processedData.bucketValues.map(String))
      .range([0, height]);
    // .padding(0.1);

    const colorScale = getColorScale(
      processedData.maxCount,
      colorTheme,
      isDark,
    );

    g.selectAll(".cell")
      .data(processedData.heatmapData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.formattedTime) || 0)
      .attr("y", (d) => yScale(String(d.bucket)) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) =>
        d.count === 0 ? "transparent" : colorScale(d.count),
      )
      .on("mouseover", (event, d) => {
        const [mouseX, mouseY] = d3.pointer(event, document.body);

        setHoveredCell({
          bucket: d.bucket,
          time: d.formattedTime,
          count: d.count,
          x: mouseX,
          y: mouseY,
        });

        const columnData = processedData.heatmapData
          .filter((point) => point.formattedTime === d.formattedTime)
          .sort((a, b) => b.bucket - a.bucket)
          .map((point) => ({
            bucket: point.bucket,
            time: point.formattedTime,
            count: point.count,
            x: mouseX,
            y: mouseY,
          }));

        setTooltipData(columnData);

        g.selectAll(".highlight-row").remove();
        g.selectAll(".highlight-col").remove();

        g.append("rect")
          .attr("class", "highlight-row")
          .attr("x", 0)
          .attr("y", yScale(String(d.bucket)) || 0)
          .attr("width", width)
          .attr("height", 1)
          .attr("fill", "rgba(200, 200, 200, 0.5)")
          .attr("pointer-events", "none");

        g.append("rect")
          .attr("class", "highlight-col")
          .attr("x", xScale(d.formattedTime) || 0)
          .attr("y", 0)
          .attr("width", 1)
          .attr("height", height)
          .attr("fill", "rgba(200, 200, 200, 0.5)")
          .attr("pointer-events", "none");
      })
      .on("mouseout", () => {
        setTooltipData(null);
        g.selectAll(".highlight-row").remove();
        g.selectAll(".highlight-col").remove();
      });

    const xAxis = g
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3.axisBottom(xScale).tickFormat((d, i) => {
          return i % (processedData.timePoints.length / 20) === 0 ? d : "";
        }),
      );

    xAxis
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g").call(
      d3.axisLeft(yScale).tickFormat((d, i) => {
        return i % (processedData.bucketValues.length / 10) === 0 ? d : "";
      }),
    );

    // svg
    //   .append("text")
    //   .attr("x", (width + margin.left + margin.right) / 2)
    //   .attr("y", margin.top / 2)
    //   .attr("text-anchor", "middle")
    //   .style("font-size", "16px")
    //   .style("font-weight", "bold")
    //   .text(
    //     data?.type?.columns.map((col) => col.name).join(" - ") || "Histogram",
    //   );

    const legendWidth = 20;
    const legendHeight = height;
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width + margin.left + 10}, ${margin.top})`,
      );

    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      const value = offset * processedData.maxCount;
      linearGradient
        .append("stop")
        .attr("offset", `${offset * 100}%`)
        .attr("stop-color", colorScale(value));
    }

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

    const legendAxis = d3
      .axisRight(
        d3
          .scaleLinear()
          .domain([0, processedData.maxCount])
          .range([legendHeight, 0]),
      )
      .ticks(5);

    legend
      .append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);

    legend
      .append("text")
      .attr("transform", "rotate(90)")
      .attr("x", legendHeight / 2)
      .attr("y", -legendWidth - 35)
      .style("text-anchor", "middle")
      .text("Count");
  }, [processedData, loading, colorTheme, isDark]);

  useEffect(() => {
    if (!tooltipData || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const padding = 10;

    const firstPoint = tooltipData[0];

    let left = firstPoint.x + padding;
    let top = firstPoint.y + padding;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const tooltipRect = tooltip.getBoundingClientRect();

    if (left + tooltipRect.width > viewportWidth - padding) {
      left = firstPoint.x - tooltipRect.width - padding;
    }

    if (top + tooltipRect.height > viewportHeight - padding) {
      top = firstPoint.y - tooltipRect.height - padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = "visible";
  }, [tooltipData]);

  if (processedData.heatmapData.length === 0) {
    return (
      <div className="p-4 text-center">
        No histogram data was found given that query.
      </div>
    );
  }

  return (
    <div className="overflow-auto p-4">
      <div className="mb-4 flex items-end justify-between">
        <div>
          {data?.type?.columns.map((col, i) => {
            return (
              <h2 className="text-xl font-semibold" key={i}>
                {col.name}
              </h2>
            );
          })}
        </div>

        <div className="text-right text-xs">
          <p>Time points: {processedData.timePoints.length}</p>
          <p>Bucket count: {processedData.bucketValues.length}</p>
          <p>Max count: {processedData.maxCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Color Theme:</label>
          <Select
            value={colorTheme}
            onValueChange={(value) => setColorTheme(value as typeof colorTheme)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select color theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spectral">Spectral (Blue→Red)</SelectItem>
              <SelectItem value="blues">Blues</SelectItem>
              <SelectItem value="reds">Reds</SelectItem>
              <SelectItem value="viridis">Viridis</SelectItem>
              <SelectItem value="plasma">Plasma</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <svg ref={svgRef} className="w-full overflow-visible"></svg>
      </div>

      {tooltipData && (
        <div
          ref={tooltipRef}
          className="absolute z-50 rounded border bg-white p-2 shadow-lg dark:bg-black dark:text-white"
        >
          <h3 className="mb-2 font-semibold">{hoveredCell?.time}</h3>
          {tooltipData.map((data, i) => {
            return (
              <div
                key={`${i}-${data.x}-${data.y}`}
                className={`flex justify-between text-xs opacity-50 ${data.bucket === hoveredCell?.bucket && "bg-muted opacity-100"}`}
              >
                <div>{data.bucket}</div>
                <div>{data.count}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* TODO: later */}
      {/* {next && <div ref={targetRef} className="mt-4 h-4" />} */}
    </div>
  );
}

const getColorScale = (
  maxCount: number,
  colorTheme: string,
  isDark: boolean,
) => {
  switch (colorTheme) {
    case "spectral":
      // Reversed spectral: low = blue, high = red
      return d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator((t) => d3.interpolateSpectral(1 - t));

    case "blues":
      return d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator((t) => {
          if (t === 0) return "transparent";

          if (isDark) {
            // Dark mode: low = slightly visible, high = bright blue
            const baseColor = d3.rgb(d3.interpolateBlues(0.8));
            const alpha = 0.3 + t * 0.7;
            return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`;
          } else {
            // Light mode: low = white-ish blue, high = dark blue
            const darkBlue = d3.rgb(d3.interpolateBlues(0.9));
            const lightBlue = d3.rgb(d3.interpolateBlues(0.1));
            const r = Math.round(lightBlue.r + (darkBlue.r - lightBlue.r) * t);
            const g = Math.round(lightBlue.g + (darkBlue.g - lightBlue.g) * t);
            const b = Math.round(lightBlue.b + (darkBlue.b - lightBlue.b) * t);
            return `rgb(${r}, ${g}, ${b})`;
          }
        });

    case "reds":
      return d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator((t) => {
          if (t === 0) return "transparent";

          if (isDark) {
            // Dark mode: low = slightly visible, high = bright red
            const baseColor = d3.rgb(d3.interpolateReds(0.8));
            const alpha = 0.3 + t * 0.7;
            return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`;
          } else {
            // Light mode: low = white-ish red, high = dark red
            const darkRed = d3.rgb(d3.interpolateReds(0.9));
            const lightRed = d3.rgb(d3.interpolateReds(0.1));
            const r = Math.round(lightRed.r + (darkRed.r - lightRed.r) * t);
            const g = Math.round(lightRed.g + (darkRed.g - lightRed.g) * t);
            const b = Math.round(lightRed.b + (darkRed.b - lightRed.b) * t);
            return `rgb(${r}, ${g}, ${b})`;
          }
        });

    case "viridis":
      return d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator((t) => {
          if (t === 0) return "transparent";
          return d3.interpolateViridis(t);
        });

    case "plasma":
      return d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator((t) => {
          if (t === 0) return "transparent";
          return d3.interpolatePlasma(t);
        });

    default:
      return d3
        .scaleSequential()
        .domain([0, maxCount])
        .interpolator(d3.interpolateSpectral);
  }
};

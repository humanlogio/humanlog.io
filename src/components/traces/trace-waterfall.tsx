"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Span } from "api/js/types/v1/tracing_pb";
import { formatDuration, getUnixTimestamp } from "@/lib/utils/formatTimeStamp";

interface TraceWaterfallProps {
  spans: Span[];
}

const TraceWaterfall: React.FC<TraceWaterfallProps> = ({ spans }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Color palette for services
  const serviceColors = [
    "#69b3a2", // teal
    "#e41a1c", // red
    "#377eb8", // blue
    "#4daf4a", // green
    "#984ea3", // purple
    "#ff7f00", // orange
    "#ffff33", // yellow
    "#a65628", // brown
    "#f781bf", // pink
    "#999999", // gray
  ];

  const getServiceColor = (serviceName: string) => {
    return "#69b3a2";
  };

  useEffect(() => {
    if (
      !spans ||
      spans.length === 0 ||
      !svgRef.current ||
      !containerRef.current
    )
      return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.max(800, entry.contentRect.width);
        updateChart(width);
      }
    });

    resizeObserver.observe(containerRef.current);

    const updateChart = (width: number) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const rowHeight = 48;
      const margin = { top: 0, left: 0, right: 40, bottom: 40 };

      const minStart = d3.min(spans, (d) =>
        d.timing ? getUnixTimestamp(d.timing.start!) : Infinity,
      )!;
      const maxEnd = d3.max(spans, (d) =>
        d.timing
          ? getUnixTimestamp(d.timing.start!) +
            Number(d.timing.duration?.seconds) * 1000 +
            d.timing.duration!.nanos / 1_000_000
          : 0,
      )!;

      const xScale = d3
        .scaleLinear()
        .domain([minStart, maxEnd])
        .range([0, width - margin.left - margin.right]);

      const spanMap = new Map(spans.map((s) => [s.spanId, s]));
      const yPositions = spans.map((_, i) => i * rowHeight);

      svg
        .attr("width", width)
        .attr(
          "height",
          yPositions.length * rowHeight + margin.top + margin.bottom,
        );

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Add time axis
      const xAxis = d3
        .axisTop(xScale)
        .ticks(10)
        .tickFormat((d) => {
          const durationMs = Number(d) - minStart;
          if (durationMs < 1000) {
            return `${durationMs.toFixed(0)}ms`;
          } else if (durationMs < 60000) {
            return `${(durationMs / 1000).toFixed(1)}s`;
          } else {
            const minutes = Math.floor(durationMs / 60000);
            const seconds = ((durationMs % 60000) / 1000).toFixed(1);
            return `${minutes}m ${seconds}s`;
          }
        });

      g.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .attr("font-size", "12px");

      // Draw each span box
      spans.forEach((span, i) => {
        if (!span.timing) return;

        const startX = xScale(getUnixTimestamp(span.timing.start!));
        const durationMs =
          Number(span.timing.duration?.seconds) * 1000 +
          span.timing.duration!.nanos / 1_000_000;
        const barWidth = Math.max(
          1,
          xScale(minStart + durationMs) - xScale(minStart),
        );
        const y = i * rowHeight;

        const group = g
          .append("g")
          .attr("transform", `translate(${startX}, ${y})`);

        // Bar
        group
          .append("rect")
          .attr("height", 20)
          .attr("width", barWidth)
          .attr("fill", "#69b3a2")
          .attr("rx", 4);

        // Span name
        group
          .append("text")
          .text(barWidth > 27 ? formatDuration(span.timing.duration) : "")
          .attr("x", 4)
          .attr("y", 15)
          .attr("font-size", 10)
          .attr("fill", "white");
      });
    };

    // Initial render
    updateChart(containerRef.current.clientWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, [spans]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full overflow-visible" />
    </div>
  );
};

export default TraceWaterfall;

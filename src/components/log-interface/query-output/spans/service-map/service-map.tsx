import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { formatDuration } from "@/lib/utils/format-timestamp";
import { DurationSchema } from "@bufbuild/protobuf/wkt";
import * as d3 from "d3";
import { generateServiceCallMap } from "@/components/log-interface/query-output/spans/service-map/utils/service-call-analyzer";
import {
  Node,
  Link,
} from "@/components/log-interface/query-output/spans/service-map/types";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { create } from "@bufbuild/protobuf";

interface ServiceMapProps {
  spans: Span[];
}

// Service Map component
export const ServiceMap = ({ spans }: ServiceMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [serviceCallMap, setServiceCallMap] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const d3NodesRef = useRef<d3.Selection<
    SVGGElement,
    any,
    SVGGElement,
    unknown
  > | null>(null);
  const d3LinksRef = useRef<d3.Selection<
    SVGLineElement,
    any,
    SVGGElement,
    unknown
  > | null>(null);
  const d3LinkLabelsRef = useRef<d3.Selection<
    SVGTextElement,
    any,
    SVGGElement,
    unknown
  > | null>(null);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (svgContainerRef.current) {
        const rect = svgContainerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Initial measurement
    handleResize();

    // Add resize observer for more accurate tracking
    const resizeObserver = new ResizeObserver(handleResize);
    if (svgContainerRef.current) {
      resizeObserver.observe(svgContainerRef.current);
    }

    // Fallback resize listener
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!spans) return;

    // Generate Service Map data with precomputed metadata
    const serviceCallMap = generateServiceCallMap(spans);
    setServiceCallMap(serviceCallMap);
  }, [spans]);

  // D3 Hierarchical Layout Setup - REMOVED selectedNode from dependencies
  useEffect(() => {
    if (
      !serviceCallMap ||
      !serviceCallMap.nodes ||
      !serviceCallMap.links ||
      !svgRef.current
    ) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;
    const { nodes, links } = serviceCallMap;

    const isDarkMode = document.documentElement.classList.contains("dark");
    const textColor = isDarkMode ? "#f9fafb" : "#1f2937";
    const secondaryTextColor = isDarkMode ? "#d1d5db" : "#6b7280";

    // Group nodes by level
    const nodesByLevel: { [key: number]: Node[] } = {};
    nodes.forEach((node: Node) => {
      const level = node.level || 0;
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      nodesByLevel[level].push(node);
    });

    const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number));
    const levelHeight = (height - 100) / (maxLevel + 1);
    const nodeRadius = 40;

    // Position nodes hierarchically
    const positionedNodes = nodes.map((node: Node) => {
      const level = node.level || 0;
      const nodesAtLevel = nodesByLevel[level];
      const nodeIndex = nodesAtLevel.findIndex((n) => n.id === node.id);
      const levelWidth = width - 200;
      const nodeSpacing = Math.max(150, levelWidth / (nodesAtLevel.length + 1));

      return {
        ...node,
        x: 100 + nodeSpacing * (nodeIndex + 1),
        y: 75 + level * levelHeight,
        fx: 100 + nodeSpacing * (nodeIndex + 1),
        fy: 75 + level * levelHeight,
      };
    });

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Add background rect for click detection (to clear selection)
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("pointer-events", "all")
      .on("click", () => {
        // Clear selection when clicking on background
        setSelectedNode(null);
      });

    // Helper functions for highlighting
    const highlightConnectedLinks = (
      nodeId: string,
      isHighlighted: boolean,
    ) => {
      const highlightColor = isDarkMode ? "#fbbf24" : "#f59e0b"; // amber-400/500
      const normalColor = secondaryTextColor;
      const highlightWidth = 4;
      const normalWidth = 2;

      // Highlight links where this node is source or target
      if (d3LinksRef.current) {
        d3LinksRef.current
          .filter((d: any) => {
            const linkData = d as Link;
            return linkData.source === nodeId || linkData.target === nodeId;
          })
          .attr("stroke", isHighlighted ? highlightColor : normalColor)
          .attr("stroke-width", isHighlighted ? highlightWidth : normalWidth);
      }

      // Highlight link labels
      if (d3LinkLabelsRef.current) {
        d3LinkLabelsRef.current
          .filter((d: any) => {
            const linkData = d as Link;
            return linkData.source === nodeId || linkData.target === nodeId;
          })
          .attr("fill", isHighlighted ? highlightColor : normalColor)
          .attr("font-weight", isHighlighted ? "bold" : "normal");
      }
    };

    const highlightNode = (nodeId: string, isHighlighted: boolean) => {
      if (d3NodesRef.current) {
        d3NodesRef.current
          .filter((d: any) => (d as Node).id === nodeId)
          .select("circle")
          .attr("stroke-width", isHighlighted ? 5 : 3)
          .attr("fill-opacity", isHighlighted ? 0.4 : 0.2);
      }
    };

    // Expose highlighting functions for external use
    (svg.node() as any).highlightConnectedLinks = highlightConnectedLinks;
    (svg.node() as any).highlightNode = highlightNode;

    // Add arrow marker definition
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", secondaryTextColor);

    // Create links
    const link = g
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", secondaryTextColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .attr("x1", (d: any) => {
        const sourceNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).source,
        );
        return sourceNode ? sourceNode.x : 0;
      })
      .attr("y1", (d: any) => {
        const sourceNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).source,
        );
        return sourceNode ? sourceNode.y : 0;
      })
      .attr("x2", (d: any) => {
        const targetNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).target,
        );
        return targetNode ? targetNode.x : 0;
      })
      .attr("y2", (d: any) => {
        const targetNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).target,
        );
        return targetNode ? targetNode.y : 0;
      });

    // Store reference for highlighting updates
    d3LinksRef.current = link;

    // Create link labels
    const linkLabel = g
      .selectAll(".link-label")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .attr("font-size", "12px")
      .attr("fill", secondaryTextColor)
      .attr("x", (d: any) => {
        const sourceNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).source,
        );
        const targetNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).target,
        );
        return sourceNode && targetNode ? (sourceNode.x + targetNode.x) / 2 : 0;
      })
      .attr("y", (d: any) => {
        const sourceNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).source,
        );
        const targetNode = positionedNodes.find(
          (n: Node) => n.id === (d as Link).target,
        );
        return sourceNode && targetNode ? (sourceNode.y + targetNode.y) / 2 : 0;
      })
      .text((d: any) => {
        const linkData = d as Link;
        const avgDurationMs = linkData.avgDuration;
        if (avgDurationMs === 0) return "";

        // Convert to Duration for formatting
        const seconds = Math.floor(avgDurationMs / 1000);
        const nanos = (avgDurationMs % 1000) * 1_000_000;
        const duration = create(DurationSchema, {
          seconds: BigInt(seconds),
          nanos,
        });
        return `avg: ${formatDuration(duration)}`;
      });

    // Store reference for highlighting updates
    d3LinkLabelsRef.current = linkLabel;

    // Create node groups
    const node = g
      .selectAll(".node")
      .data(positionedNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d: any) => `translate(${(d as Node).x},${(d as Node).y})`,
      );

    // Store reference for highlighting updates
    d3NodesRef.current = node;

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d: any) => (d as Node).color)
      .attr("fill-opacity", 0.2)
      .attr("stroke", (d: any) => (d as Node).color)
      .attr("stroke-width", 3)
      .on("mouseover", function (event, d: any) {
        const nodeData = d as Node;
        d3.select(this).attr("fill-opacity", 0.4);

        // Highlight connected links
        highlightConnectedLinks(nodeData.id, true);
        highlightNode(nodeData.id, true);

        // Show tooltip
        const tooltip = g
          .append("g")
          .attr("id", "tooltip")
          .attr("transform", `translate(${nodeData.x}, ${nodeData.y})`);

        tooltip
          .append("rect")
          .attr("x", -60)
          .attr("y", -80)
          .attr("width", 120)
          .attr("height", 60)
          .attr("fill", isDarkMode ? "#374151" : "white")
          .attr("stroke", isDarkMode ? "#6b7280" : "#ccc")
          .attr("stroke-width", 1)
          .attr("rx", 4);

        tooltip
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -60)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", textColor)
          .text(nodeData.name);

        tooltip
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -45)
          .attr("font-size", "10px")
          .attr("fill", secondaryTextColor)
          .text(`${nodeData.spanCount} spans`);

        const callers = serviceCallMap.getCallers(nodeData.id);
        const callees = serviceCallMap.getCallees(nodeData.id);

        tooltip
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -30)
          .attr("font-size", "10px")
          .attr("fill", secondaryTextColor)
          .text(`Calls: ${callees.length} | Called by: ${callers.length}`);
      })
      .on("mouseout", function (event, d: any) {
        const nodeData = d as Node;
        d3.select(this).attr("fill-opacity", 0.2);

        // Remove highlighting unless this node is selected
        if (selectedNode !== nodeData.id) {
          highlightConnectedLinks(nodeData.id, false);
          highlightNode(nodeData.id, false);
        }

        g.select("#tooltip").remove();
      })
      .on("click", function (event, d: any) {
        event.stopPropagation(); // Prevent background click
        const nodeData = d as Node;

        // Toggle selection
        if (selectedNode === nodeData.id) {
          setSelectedNode(null);
        } else {
          setSelectedNode(nodeData.id);
        }
      });

    // Add service name labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", textColor)
      .text((d: any) => (d as Node).name);

    // Add span count labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 10)
      .attr("font-size", "10px")
      .attr("fill", secondaryTextColor)
      .text((d: any) => `${(d as Node).spanCount} spans`);
  }, [serviceCallMap, dimensions]); // Removed selectedNode from dependencies

  // Separate useEffect for handling selection highlighting without re-rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current as any;
    const highlightConnectedLinks = svgElement.highlightConnectedLinks;
    const highlightNode = svgElement.highlightNode;

    if (!highlightConnectedLinks || !highlightNode) return;

    // Clear all previous highlights
    if (d3NodesRef.current) {
      d3NodesRef.current
        .selectAll("circle")
        .attr("stroke-width", 3)
        .attr("fill-opacity", 0.2);
    }

    if (d3LinksRef.current && d3LinkLabelsRef.current) {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const secondaryTextColor = isDarkMode ? "#d1d5db" : "#6b7280";

      d3LinksRef.current
        .attr("stroke", secondaryTextColor)
        .attr("stroke-width", 2);

      d3LinkLabelsRef.current
        .attr("fill", secondaryTextColor)
        .attr("font-weight", "normal");
    }

    // Apply highlighting for selected node
    if (selectedNode) {
      highlightConnectedLinks(selectedNode, true);
      highlightNode(selectedNode, true);
    }
  }, [selectedNode]);
  if (!serviceCallMap) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading service map...</div>
      </div>
    );
  }

  const { nodes } = serviceCallMap;

  // Get detailed info for selected node (now optimized)
  const getSelectedNodeInfo = () => {
    if (!selectedNode) return null;

    // Use O(1) map lookup instead of O(n) find
    const node = serviceCallMap.getNode(selectedNode);
    if (!node) return null;

    const callers = serviceCallMap.getCallers(selectedNode);
    const callees = serviceCallMap.getCallees(selectedNode);

    // Use precomputed data instead of filtering spans
    const traceIds = serviceCallMap.getServiceTraceIds(selectedNode);
    const totalSpans = serviceCallMap.getServiceSpanCount(selectedNode);

    return {
      node,
      callers,
      callees,
      traceIds,
      totalSpans,
    };
  };

  const selectedNodeInfo = getSelectedNodeInfo();

  return (
    <div className="w-full" ref={containerRef}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Service Architecture Map</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hierarchical service map showing call relationships from top to
          bottom. Zoom/pan to explore.
        </p>
      </div>

      <div className="bg-background dark:bg-background h-[calc(100vh-200px)] overflow-hidden rounded-lg border">
        <div className="flex h-full">
          <div
            ref={svgContainerRef}
            className="bg-card dark:bg-card flex-1 overflow-hidden border-r"
          >
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="h-full w-full cursor-move"
              style={{ background: "transparent" }}
            />
          </div>

          {/* Service Stats */}
          <div className="bg-muted/50 dark:bg-muted/50 flex w-80 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                {selectedNodeInfo ? (
                  // Selected Node Details
                  <>
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: selectedNodeInfo.node.color,
                          }}
                        />
                        <h4 className="text-foreground dark:text-foreground text-lg font-semibold">
                          {selectedNodeInfo.node.name}
                        </h4>
                        <span className="text-muted-foreground bg-muted dark:bg-muted rounded px-2 py-1 text-xs">
                          Level {selectedNodeInfo.node.level}
                        </span>
                      </div>
                      <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                        {selectedNodeInfo.totalSpans} spans across{" "}
                        {selectedNodeInfo.traceIds.length} traces
                      </p>
                    </div>

                    {/* Trace IDs */}
                    <div className="mb-4">
                      <h5 className="text-foreground dark:text-foreground mb-2 text-sm font-medium">
                        Traces ({selectedNodeInfo.traceIds.length})
                      </h5>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {selectedNodeInfo.traceIds.map((traceId: string) => (
                          <div
                            key={traceId}
                            className="bg-card dark:bg-card rounded p-2 text-xs"
                          >
                            <code className="text-foreground dark:text-foreground font-mono text-xs break-all">
                              {traceId}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Incoming Services */}
                    <div className="mb-4">
                      <h5 className="text-foreground dark:text-foreground mb-2 text-sm font-medium">
                        Incoming Services ({selectedNodeInfo.callers.length})
                      </h5>
                      {selectedNodeInfo.callers.length > 0 ? (
                        <div className="space-y-1">
                          {selectedNodeInfo.callers.map((caller: string) => {
                            const callerNode = serviceCallMap.nodesMap[caller];
                            const avgDuration = serviceCallMap.getAvgDuration(
                              caller,
                              selectedNode,
                            );
                            const seconds = Math.floor(avgDuration / 1000);
                            const nanos = (avgDuration % 1000) * 1_000_000;
                            const duration = create(DurationSchema, {
                              seconds: BigInt(seconds),
                              nanos,
                            });

                            return (
                              <div
                                key={caller}
                                className="bg-card dark:bg-card flex items-center justify-between rounded p-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      backgroundColor:
                                        callerNode?.color || "#6b7280",
                                    }}
                                  />
                                  <span className="text-foreground dark:text-foreground">
                                    {caller}
                                  </span>
                                </div>
                                <span className="text-muted-foreground dark:text-muted-foreground">
                                  {avgDuration > 0
                                    ? formatDuration(duration)
                                    : "N/A"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground dark:text-muted-foreground text-xs italic">
                          No incoming services (root service)
                        </p>
                      )}
                    </div>

                    {/* Outgoing Services */}
                    <div className="mb-4">
                      <h5 className="text-foreground dark:text-foreground mb-2 text-sm font-medium">
                        Outgoing Services ({selectedNodeInfo.callees.length})
                      </h5>
                      {selectedNodeInfo.callees.length > 0 ? (
                        <div className="space-y-1">
                          {selectedNodeInfo.callees.map((callee: string) => {
                            const calleeNode = serviceCallMap.nodesMap[callee];
                            const avgDuration = serviceCallMap.getAvgDuration(
                              selectedNode,
                              callee,
                            );
                            const seconds = Math.floor(avgDuration / 1000);
                            const nanos = (avgDuration % 1000) * 1_000_000;
                            const duration = create(DurationSchema, {
                              seconds: BigInt(seconds),
                              nanos,
                            });

                            return (
                              <div
                                key={callee}
                                className="bg-card dark:bg-card flex items-center justify-between rounded p-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      backgroundColor:
                                        calleeNode?.color || "#6b7280",
                                    }}
                                  />
                                  <span className="text-foreground dark:text-foreground">
                                    {callee}
                                  </span>
                                </div>
                                <span className="text-muted-foreground dark:text-muted-foreground">
                                  {avgDuration > 0
                                    ? formatDuration(duration)
                                    : "N/A"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground dark:text-muted-foreground text-xs italic">
                          No outgoing services (leaf service)
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  // All Services List
                  <>
                    <div className="mb-2">
                      <h4 className="text-foreground dark:text-foreground text-sm font-semibold">
                        Service Details
                      </h4>
                      <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                        {nodes.length} services detected
                      </p>
                    </div>
                    {nodes.map((node: any, index: number) => {
                      const callers = serviceCallMap.getCallers(node.id);
                      const callees = serviceCallMap.getCallees(node.id);

                      return (
                        <Card
                          key={node.id}
                          className="border-border dark:border-border bg-card dark:bg-card hover:bg-muted/30 cursor-pointer p-3 shadow-none transition-all"
                          onClick={() => {
                            // Toggle selection
                            if (selectedNode === node.id) {
                              setSelectedNode(null);
                            } else {
                              setSelectedNode(node.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: node.color }}
                            />
                            <h4 className="text-sm font-medium">{node.name}</h4>
                            <span className="text-muted-foreground bg-muted dark:bg-muted rounded px-1.5 py-0.5 text-xs">
                              L{node.level}
                            </span>
                          </div>
                          <div className="text-muted-foreground dark:text-muted-foreground mt-1 text-xs">
                            <div>Spans: {node.spanCount}</div>
                            <div>Calls: {callees.length}</div>
                            <div>Called by: {callers.length}</div>
                          </div>
                        </Card>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

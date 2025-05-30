import { Card } from "@/components/ui/card";
import { Span } from "api/js/types/v1/tracing_pb";
import { useEffect, useState } from "react";
import { getColorByIndex } from "@/lib/utils/colors";

interface ServiceMapProps {
  spans: Span[];
}

// Service Map component
export const ServiceMap = ({ spans }: ServiceMapProps) => {
  const svgRef = useState<SVGSVGElement | null>(null)[1];

  const [serviceCallMap, setServiceCallMap] = useState<any>(null);

  useEffect(() => {
    if (!spans) return;

    // Method 1: Object form with serviceName as key
    const spansByService: { [key: string]: Span[] } = {};

    // Method 2: Array with serviceName as key
    const serviceGroups: { serviceName: string; spans: Span[] }[] = [];

    spans.forEach((span) => {
      // Method 1: Group by object form
      if (!spansByService[span.serviceName]) {
        spansByService[span.serviceName] = [];
      }
      spansByService[span.serviceName].push(span);

      // Method 2: Group by array form
      const existingGroup = serviceGroups.find(
        (group) => group.serviceName === span.serviceName,
      );
      if (existingGroup) {
        existingGroup.spans.push(span);
      } else {
        serviceGroups.push({
          serviceName: span.serviceName,
          spans: [span],
        });
      }
    });

    // Generate Service Map data
    const serviceCallMap = generateServiceCallMap(spans);
    setServiceCallMap(serviceCallMap);

    // Logs for result verification (development only)
    console.log("Method 1 - Object form:", spansByService);
    console.log("Method 2 - Array form:", serviceGroups);
    console.log("Service Call Map:", serviceCallMap);

    // Output span count for each service
    Object.entries(spansByService).forEach(([serviceName, spans]) => {
      console.log(`Service: ${serviceName}, Spans: ${spans.length}`);
    });
  }, [spans]);

  // Function to analyze inter-service call relationships for Service Map
  const generateServiceCallMap = (spans: Span[]) => {
    // spanId to service mapping
    const spanToService: { [key: string]: string } = {};
    spans.forEach((span) => {
      spanToService[span.spanId] = span.serviceName;
    });

    // Service call relationships
    const serviceCalls: { [key: string]: Set<string> } = {}; // caller -> Set of callees
    const serviceCallCounts: { [key: string]: { [key: string]: number } } = {}; // caller -> callee -> count
    const allServices = new Set<string>();

    spans.forEach((span) => {
      const currentService = span.serviceName;
      allServices.add(currentService);

      // If this span has a parent, find the parent's service
      if (span.parentSpanId && span.parentSpanId !== "") {
        const parentService = spanToService[span.parentSpanId];

        if (parentService && parentService !== currentService) {
          // Parent service calls current service
          if (!serviceCalls[parentService]) {
            serviceCalls[parentService] = new Set();
          }
          serviceCalls[parentService].add(currentService);

          // Count the calls
          if (!serviceCallCounts[parentService]) {
            serviceCallCounts[parentService] = {};
          }
          if (!serviceCallCounts[parentService][currentService]) {
            serviceCallCounts[parentService][currentService] = 0;
          }
          serviceCallCounts[parentService][currentService]++;
        }
      }
    });

    // Convert Sets to Arrays for easier consumption
    const serviceCallsArray: { [key: string]: string[] } = {};
    Object.entries(serviceCalls).forEach(([caller, callees]) => {
      serviceCallsArray[caller] = Array.from(callees);
    });

    // Generate nodes and edges for service map visualization
    const nodes = Array.from(allServices).map((service) => ({
      id: service,
      name: service,
      type: "service",
      spanCount: spans.filter((span) => span.serviceName === service).length,
    }));

    const edges: Array<{
      source: string;
      target: string;
      callCount: number;
      type: "service-call";
    }> = [];

    Object.entries(serviceCallCounts).forEach(([caller, callees]) => {
      Object.entries(callees).forEach(([callee, count]) => {
        edges.push({
          source: caller,
          target: callee,
          callCount: count,
          type: "service-call",
        });
      });
    });

    return {
      // Raw data
      serviceCalls: serviceCallsArray, // { "service-a": ["service-b", "service-c"] }
      serviceCallCounts, // { "service-a": { "service-b": 5, "service-c": 3 } }
      allServices: Array.from(allServices),

      // Visualization-ready data
      nodes,
      edges,

      // Helper methods
      getCallers: (service: string) => {
        const callers: string[] = [];
        Object.entries(serviceCallsArray).forEach(([caller, callees]) => {
          if (callees.includes(service)) {
            callers.push(caller);
          }
        });
        return callers;
      },

      getCallees: (service: string) => {
        return serviceCallsArray[service] || [];
      },

      getCallCount: (caller: string, callee: string) => {
        return serviceCallCounts[caller]?.[callee] || 0;
      },

      // Get all call paths from a service
      getCallPaths: (
        fromService: string,
        visited: Set<string> = new Set(),
      ): string[][] => {
        if (visited.has(fromService)) return []; // Avoid cycles

        const paths: string[][] = [];
        const callees = serviceCallsArray[fromService] || [];

        if (callees.length === 0) {
          return [[fromService]]; // Leaf service
        }

        visited.add(fromService);
        callees.forEach((callee) => {
          const subPaths = generateServiceCallMap(spans).getCallPaths(
            callee,
            new Set(visited),
          );
          subPaths.forEach((subPath) => {
            paths.push([fromService, ...subPath]);
          });
        });
        visited.delete(fromService);

        return paths;
      },
    };
  };

  useEffect(() => {
    if (!serviceCallMap || !serviceCallMap.nodes || !serviceCallMap.edges)
      return;

    // Implement with simple SVG without directly importing D3 library
    // Recommend using D3 or other graph libraries in production
  }, [serviceCallMap]);

  if (!serviceCallMap) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Loading service map...</div>
      </div>
    );
  }

  const { nodes, edges } = serviceCallMap;

  // Simple service map layout (circular arrangement)
  const centerX = 400;
  const centerY = 300;
  const radius = 150;

  const nodePositions = nodes.map((node: any, index: number) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="w-full overflow-auto">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Service Architecture Map</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Services and their call relationships
        </p>
      </div>

      <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
        <svg width="800" height="600" className="h-auto w-full">
          {/* Edges (connections) */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              className="fill-gray-600"
            >
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>

          {edges.map((edge: any, index: number) => {
            const sourceNode = nodePositions.find(
              (n: any) => n.id === edge.source,
            );
            const targetNode = nodePositions.find(
              (n: any) => n.id === edge.target,
            );

            if (!sourceNode || !targetNode) return null;

            return (
              <g key={index}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#6B7280"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {/* Call count label */}
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 5}
                  textAnchor="middle"
                  className="fill-gray-600 text-xs"
                >
                  {edge.callCount}
                </text>
              </g>
            );
          })}

          {/* Nodes (services) */}
          {nodePositions.map((node: any, index: number) => {
            const color = getColorByIndex(index);

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="40"
                  fill={color}
                  fillOpacity="0.2"
                  stroke={color}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y - 5}
                  textAnchor="middle"
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {node.name}
                </text>
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  className="fill-gray-600 text-xs dark:fill-gray-400"
                >
                  {node.spanCount} spans
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

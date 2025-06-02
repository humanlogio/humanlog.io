import { Span } from "api/js/types/v1/tracing_pb";
import { getColorByIndex } from "@/lib/utils/colors";
import type {
  ServiceCallMap,
  Node,
  Link,
} from "@/components/log-interface/query-output/traces/service-map/types";

/**
 * Analyzes inter-service call relationships for Service Map
 * @param spans Array of spans to analyze
 * @returns ServiceCallMap object with analyzed data and helper functions
 */
export function generateServiceCallMap(spans: Span[]): ServiceCallMap {
  // spanId to service mapping
  const spanToService: { [key: string]: string } = {};
  spans.forEach((span) => {
    spanToService[span.spanId] = span.serviceName;
  });

  // Service call relationships
  const serviceCalls: { [key: string]: Set<string> } = {}; // caller -> Set of callees
  const serviceCallCounts: { [key: string]: { [key: string]: number } } = {}; // caller -> callee -> count
  const serviceCallDurations: { [key: string]: { [key: string]: number[] } } =
    {}; // caller -> callee -> duration array
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

        // Collect duration information
        if (!serviceCallDurations[parentService]) {
          serviceCallDurations[parentService] = {};
        }
        if (!serviceCallDurations[parentService][currentService]) {
          serviceCallDurations[parentService][currentService] = [];
        }

        // Calculate duration in milliseconds
        if (span.timing?.duration) {
          const durationMs =
            Number(span.timing.duration.seconds) * 1000 +
            Math.floor(span.timing.duration.nanos / 1_000_000);
          serviceCallDurations[parentService][currentService].push(durationMs);
        }
      }
    }
  });

  // Convert Sets to Arrays for easier consumption
  const serviceCallsArray: { [key: string]: string[] } = {};
  Object.entries(serviceCalls).forEach(([caller, callees]) => {
    serviceCallsArray[caller] = Array.from(callees);
  });

  // Find root services (services that are not called by others)
  const calledServices = new Set<string>();
  Object.values(serviceCallsArray).forEach((callees) => {
    callees.forEach((callee) => calledServices.add(callee));
  });
  const rootServices = Array.from(allServices).filter(
    (service) => !calledServices.has(service),
  );

  // Build hierarchy levels
  const serviceLevels: { [key: string]: number } = {};
  const visited = new Set<string>();

  const assignLevels = (service: string, level: number) => {
    if (visited.has(service)) return;
    visited.add(service);
    serviceLevels[service] = Math.max(serviceLevels[service] || 0, level);

    const callees = serviceCallsArray[service] || [];
    callees.forEach((callee) => {
      assignLevels(callee, level + 1);
    });
  };

  // Start from root services
  rootServices.forEach((rootService) => {
    assignLevels(rootService, 0);
  });

  // Handle any remaining services that might not be connected
  Array.from(allServices).forEach((service) => {
    if (!(service in serviceLevels)) {
      serviceLevels[service] = 0;
    }
  });

  // Generate nodes and edges for service map visualization
  const nodes: Node[] = Array.from(allServices).map((service, index) => ({
    id: service,
    name: service,
    type: "service",
    spanCount: spans.filter((span) => span.serviceName === service).length,
    color: getColorByIndex(index),
    level: serviceLevels[service] || 0,
  }));

  const links: Link[] = [];
  Object.entries(serviceCallCounts).forEach(([caller, callees]) => {
    Object.entries(callees).forEach(([callee, count]) => {
      const durations = serviceCallDurations[caller]?.[callee] || [];
      const totalDuration = durations.reduce((sum, d) => sum + d, 0);
      const avgDuration =
        durations.length > 0 ? totalDuration / durations.length : 0;

      links.push({
        source: caller,
        target: callee,
        callCount: count,
        avgDuration,
        totalDuration,
        type: "service-call",
      });
    });
  });

  return {
    // Raw data
    serviceCalls: serviceCallsArray,
    serviceCallCounts,
    allServices: Array.from(allServices),
    rootServices,
    serviceLevels,

    // D3 visualization-ready data
    nodes,
    links,

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

    getAvgDuration: (caller: string, callee: string) => {
      const durations = serviceCallDurations[caller]?.[callee] || [];
      if (durations.length === 0) return 0;
      const total = durations.reduce((sum, d) => sum + d, 0);
      return total / durations.length;
    },
  };
}

/**
 * Groups spans by service name
 * @param spans Array of spans
 * @returns Object with serviceName as key and spans array as value
 */
export function groupSpansByService(spans: Span[]): { [key: string]: Span[] } {
  const spansByService: { [key: string]: Span[] } = {};

  spans.forEach((span) => {
    if (!spansByService[span.serviceName]) {
      spansByService[span.serviceName] = [];
    }
    spansByService[span.serviceName].push(span);
  });

  return spansByService;
}

/**
 * Gets detailed information about a selected service node
 * @param selectedNode Service name
 * @param spans All spans
 * @param serviceCallMap Analyzed service call map
 * @returns Detailed node information or null
 */
export function getSelectedNodeInfo(
  selectedNode: string | null,
  spans: Span[],
  serviceCallMap: ServiceCallMap,
) {
  if (!selectedNode) return null;

  const node = serviceCallMap.nodes.find((n) => n.id === selectedNode);
  if (!node) return null;

  const callers = serviceCallMap.getCallers(selectedNode);
  const callees = serviceCallMap.getCallees(selectedNode);

  // Get trace IDs for this service
  const serviceSpans = spans.filter(
    (span) => span.serviceName === selectedNode,
  );
  const traceIds = [...new Set(serviceSpans.map((span) => span.traceId))];

  return {
    node,
    callers,
    callees,
    traceIds,
    totalSpans: serviceSpans.length,
  };
}

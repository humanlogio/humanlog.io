import { Span } from "api/js/types/v1/tracing_pb";
import * as d3 from "d3";

export interface ServiceMapProps {
  spans: Span[];
}

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  spanCount: number;
  color: string;
  level?: number;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  callCount: number;
  avgDuration: number; // Average duration in milliseconds
  totalDuration: number; // Total duration in milliseconds
  type: string;
}

export interface ServiceCallMap {
  // Raw data
  serviceCalls: { [key: string]: string[] };
  serviceCallCounts: { [key: string]: { [key: string]: number } };
  allServices: string[];
  rootServices: string[];
  serviceLevels: { [key: string]: number };

  // D3 visualization-ready data
  nodes: Node[];
  links: Link[];

  // Helper methods
  getCallers: (service: string) => string[];
  getCallees: (service: string) => string[];
  getCallCount: (caller: string, callee: string) => number;
  getAvgDuration: (caller: string, callee: string) => number;
}

export interface SelectedNodeInfo {
  node: Node;
  callers: string[];
  callees: string[];
  traceIds: string[];
  totalSpans: number;
}

export interface SampleDataScenario {
  name: string;
  description: string;
  spans: Span[];
  serviceCount: number;
  architecture: string;
}

/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Symbols } from "@/components/docs/reference/symbols/Symbols";
import { Symbol } from "@/types/docs";

export default function Page() {
  return <Symbols symbols={symbols} />;
}

const symbols: Symbol[] = JSON.parse(
  '[{"name":"_id","desc":"Internal ID for the span. This is guaranteed to always exist.","type":"string"},{"name":"_indextime","desc":"Timestamp when the span was ingested. This is guaranteed to always exist.","type":"timestamp"},{"name":"_time","desc":"Timestamp found in the span, if present. If not present, will be set to __indextime.","type":"timestamp"},{"name":"trace_id","desc":"The unique ID of the trace this span belongs to.","type":"string"},{"name":"span_id","desc":"The unique ID of a span within a trace.","type":"string"},{"name":"parent_span_id","desc":"The span ID of the parent of the span. Empty if no parent.","type":"string"},{"name":"name","desc":"Name of the span (the operation name).","type":"string"},{"name":"kind","desc":"Kind of span: INTERNAL, SERVER, CLIENT, PRODUCER or CONSUMER.","type":"string"},{"name":"service_name","desc":"Name of the service that emitted the span.","type":"string"},{"name":"duration","desc":"How long the span took.","type":"duration"},{"name":"resource","desc":"Key-values coming from the resource that emitted the span.","type":"map[unknown]unknown"},{"name":"_attributes_fingerprint","desc":"A fingerprint that represents the attributes in the span. This is not guaranteed to be unique, but it should be unique enough within a reasonable duration for querying purpose. It is derived by hashing the key-values found in the resource, and so it is subject to hashing collisions.","type":"i64"},{"name":"attributes","desc":"Key-values assigned to the span by the instrumented code.","type":"map[unknown]unknown"},{"name":"events","desc":"A list of events that occured during the span\'s lifetime.","type":"[{attributes:map[unknown]unknown, name:string, timestamp:timestamp}]"},{"name":"links","desc":"Links to other spans that were relevant in the context when this span was emitted.","type":"[{attributes:map[unknown]unknown, span_id:string, trace_id:string}]"},{"name":"scope","desc":"Information about the scope that emitted the span. Contains `version` and `name`.","type":"{name:string, schema_url:string, version:string}"},{"name":"status","desc":"The status of the span. Contains `code` and `message`.","type":"{code:string, message:string}"}]',
) as Symbol[];

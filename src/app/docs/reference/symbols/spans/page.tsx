/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Symbols } from "@/components/docs/symbols/Symbols";
import { Symbol } from "scripts/generate-references";

export default function Page() {
  return <Symbols symbols={symbols} />;
}
  
const symbols: Symbol[] = JSON.parse("[{\"name\":\"trace_id\",\"desc\":\"The unique ID of the trace this span belongs to.\",\"type\":\"scalar:str\"},{\"name\":\"span_id\",\"desc\":\"The unique ID of a span within a trace.\",\"type\":\"scalar:str\"},{\"name\":\"parent_span_id\",\"desc\":\"The span ID of the parent of the span. Empty if no parent.\",\"type\":\"scalar:str\"},{\"name\":\"name\",\"desc\":\"Name of the span (the operation name).\",\"type\":\"scalar:str\"},{\"name\":\"kind\",\"desc\":\"Kind of span: INTERNAL, SERVER, CLIENT, PRODUCER or CONSUMER.\",\"type\":\"scalar:str\"},{\"name\":\"service_name\",\"desc\":\"Name of the service that emitted the span.\",\"type\":\"scalar:str\"},{\"name\":\"time\",\"desc\":\"When the span started.\",\"type\":\"scalar:ts\"},{\"name\":\"duration\",\"desc\":\"How long the span took.\",\"type\":\"scalar:dur\"},{\"name\":\"resource\",\"desc\":\"Key-values coming from the resource that emitted the span.\",\"type\":\"map:{key:{scalar:str} value:{scalar:unknown}}\"},{\"name\":\"attributes\",\"desc\":\"Key-values assigned to the span by the instrumented code.\",\"type\":\"map:{key:{scalar:str} value:{scalar:unknown}}\"},{\"name\":\"events\",\"desc\":\"A list of events that occured during the span's lifetime.\",\"type\":\"array:{items:{object:{kvs:{key:\\\"kvs\\\" value:{map:{key:{scalar:str} value:{scalar:unknown}}}} kvs:{key:\\\"name\\\" value:{scalar:str}} kvs:{key:\\\"timestamp\\\" value:{scalar:ts}}}}}\"},{\"name\":\"links\",\"desc\":\"Links to other spans that were relevant in the context when this span was emitted.\",\"type\":\"array:{items:{object:{kvs:{key:\\\"kvs\\\" value:{map:{key:{scalar:str} value:{scalar:unknown}}}} kvs:{key:\\\"span_id\\\" value:{scalar:str}} kvs:{key:\\\"trace_id\\\" value:{scalar:str}}}}}\"},{\"name\":\"scope\",\"desc\":\"Information about the scope that emitted the span. Contains `version` and `name`.\",\"type\":\"object:{kvs:{key:\\\"name\\\" value:{scalar:str}} kvs:{key:\\\"version\\\" value:{scalar:str}}}\"},{\"name\":\"status\",\"desc\":\"The status of the span. Contains `code` and `message`.\",\"type\":\"object:{kvs:{key:\\\"code\\\" value:{scalar:str}} kvs:{key:\\\"message\\\" value:{scalar:str}}}\"}]") as Symbol[];

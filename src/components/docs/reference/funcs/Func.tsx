"use client";

import { ScalarFunc as ScalarFuncType } from "@/types/docs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CodeBlock from "@/components/CodeBlock";
import { Data } from "api/js/types/v1/data_pb";
import { DataRenderer } from "@/components/log-interface/query-output";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { Table, Val } from "api/js/types/v1/types_pb";
import { DataCase, DataValue } from "@/components/log-interface";

export function Func({ func }: { func: ScalarFuncType }) {
  const convertOutputToData = (output: any): DataValue | undefined => {
    try {
      const logs: Log[] = [];
      const freeForm: Table[] = [];
      const spans: Span[] = [];
      let shapeTypes: DataCase | undefined;

      const data = Data.fromJson(output);
      console.log("data", data);
      console.log("data.shape", data.shape);
      const { case: shapeCase, value } = data.shape;

      if (shapeCase === "logs") {
        logs.push(...value.logs);
        shapeTypes = "logs";
      } else if (shapeCase === "freeForm") {
        freeForm.push(value);
        shapeTypes = "freeForm";
      } else if (shapeCase === "spans") {
        spans.push(...value.spans);
        shapeTypes = "spans";
      }

      return {
        pages: [],
        pageParams: [],
        logs,
        freeForm,
        spans,
        shapeTypes,
      };
    } catch (error) {
      console.error("Failed to convert output to Data:", error);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden" id={func.name}>
      <div className="w-full border-b pb-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="mb-0 scroll-mt-20 text-3xl font-bold">{func.name}</h1>
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {func.category}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 text-lg">{func.desc}</p>
      </div>
      <div className="w-full space-y-4">
        <h2 className="text-xl font-semibold">Signatures</h2>
        <div className="w-full space-y-2">
          {func.signatures.map((signature, i) => (
            <div
              key={i}
              className="bg-muted w-full overflow-hidden rounded-md p-4"
            >
              <code className="overflow-wrap-anywhere font-mono text-sm whitespace-pre-wrap">
                {func.name}({signature.arg_types?.join(", ")}) →{" "}
                {signature.return_type}
              </code>
            </div>
          ))}
        </div>
      </div>

      {func.examples?.length > 0 && (
        <div className="w-full space-y-4">
          <h2 className="text-xl font-semibold">Examples</h2>
          <Accordion
            type="multiple"
            className="not-prose w-full rounded-lg border"
          >
            {func.examples.map((example, i) => {
              const convertedData = convertOutputToData(example.output);

              return (
                <AccordionItem
                  key={`${func.name}-example-${i}`}
                  value={`${func.name}-example-${i}`}
                  className="border-none px-0"
                >
                  <AccordionTrigger className="px-5 py-4 hover:bg-zinc-50 hover:no-underline dark:hover:bg-zinc-900">
                    {example.name}
                  </AccordionTrigger>
                  <AccordionContent className="border-y p-3">
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle>Query</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardContent className="p-0">
                          <CodeBlock code={example.query} language="kusto" />
                        </CardContent>
                      </CardContent>
                    </Card>

                    <div className="mt-2 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                      <Card className="w-full">
                        <CardHeader>
                          <CardTitle>Input</CardTitle>
                          <CardDescription>Sample log entries</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted max-h-80 w-full overflow-y-auto rounded-md p-4">
                            <code className="overflow-wrap-anywhere text-xs whitespace-pre-wrap">
                              {example.input.map((input, i) => {
                                return (
                                  <div key={i} className="">
                                    {input.log}
                                  </div>
                                );
                              })}
                            </code>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="w-full">
                        <CardHeader>
                          <CardTitle>Output</CardTitle>
                          <CardDescription>
                            Result after applying function
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {convertedData ? (
                            <DataRenderer data={convertedData} />
                          ) : (
                            <div className="bg-muted max-h-80 w-full overflow-y-auto rounded-md p-4">
                              <pre className="overflow-wrap-anywhere text-xs whitespace-pre-wrap">
                                {JSON.stringify(example.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
}

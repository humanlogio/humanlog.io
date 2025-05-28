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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Func({ func }: { func: ScalarFuncType }) {
  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden" id={func.name}>
      <div className="w-full border-b pb-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="mb-0 scroll-mt-20 text-3xl font-bold">{func.name}</h1>
          {func.implemented !== false ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            >
              Implemented
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            >
              Coming Soon
            </Badge>
          )}
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {func.category}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 text-lg">{func.desc}</p>
      </div>

      <div className="w-full space-y-4">
        <h2 className="text-xl font-semibold">Usage</h2>
        <div className="bg-muted w-full overflow-hidden rounded-md p-4">
          <code className="overflow-wrap-anywhere font-mono text-sm whitespace-pre-wrap">
            {func.usage}
          </code>
        </div>
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
          <Tabs defaultValue={`${func.name}-example-0`} className="w-full">
            <TabsList className="w-full flex-wrap justify-start">
              {func.examples.map((example, i) => (
                <TabsTrigger
                  key={`${func.name}-tab-${i}`}
                  value={`${func.name}-example-${i}`}
                >
                  {example.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {func.examples.map((example, i) => (
              <TabsContent
                key={`${func.name}-content-${i}`}
                value={`${func.name}-example-${i}`}
                className="mt-4 w-full space-y-4"
              >
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Query</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted w-full overflow-x-auto rounded-md p-4">
                      <code className="overflow-wrap-anywhere text-sm whitespace-pre-wrap text-black dark:text-white">
                        {example.query}
                      </code>
                    </pre>
                  </CardContent>
                </Card>

                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Input</CardTitle>
                      <CardDescription>Sample log entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted max-h-80 w-full overflow-y-auto rounded-md p-4">
                        <pre className="overflow-wrap-anywhere text-xs whitespace-pre-wrap">
                          {JSON.stringify(example.input, null, 2)}
                        </pre>
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
                      <div className="bg-muted max-h-80 w-full overflow-y-auto rounded-md p-4">
                        <pre className="overflow-wrap-anywhere text-xs whitespace-pre-wrap">
                          {JSON.stringify(example.output, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}

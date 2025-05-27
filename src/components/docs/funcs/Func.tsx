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
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="mb-0 text-3xl font-bold">{func.name}</h1>
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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Usage</h2>
        <div className="bg-muted rounded-md p-4">
          <code className="font-mono text-sm">{func.usage}</code>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Signatures</h2>
        <div className="space-y-2">
          {func.signatures.map((signature, i) => (
            <div key={i} className="bg-muted rounded-md p-4">
              <code className="font-mono text-sm">
                {func.name}({signature.arg_types.join(", ")}) →{" "}
                {signature.return_type}
              </code>
            </div>
          ))}
        </div>
      </div>

      {func.examples.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Examples</h2>
          <Tabs
            defaultValue={func.examples[0].name
              .replace(/\s+/g, "-")
              .toLowerCase()}
          >
            <TabsList className="w-full justify-start">
              {func.examples.map((example, i) => (
                <TabsTrigger
                  key={`tab-${i}`}
                  value={example.name.replace(/\s+/g, "-").toLowerCase()}
                >
                  {example.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {func.examples.map((example, i) => (
              <TabsContent
                key={`content-${i}`}
                value={example.name.replace(/\s+/g, "-").toLowerCase()}
                className="mt-4 space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Query</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted overflow-x-auto rounded-md p-4">
                      <code className="text-sm text-black dark:text-white">
                        {example.query}
                      </code>
                    </pre>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Input</CardTitle>
                      <CardDescription>Sample log entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted max-h-80 overflow-y-auto rounded-md p-4">
                        <pre className="text-xs">
                          {JSON.stringify(example.input, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Output</CardTitle>
                      <CardDescription>
                        Result after applying function
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted max-h-80 overflow-y-auto rounded-md p-4">
                        <pre className="text-xs">
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

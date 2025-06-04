"use client";

import { ScalarOperator, TabularOperator } from "@/types/docs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import CodeBlock from "@/components/CodeBlock";

interface OperatorsProps {
  operators: ScalarOperator[] | TabularOperator[];
}

export function Operators({ operators }: OperatorsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Determine if we have tabular operators (they have a syntax field)
  const hasTabularOperators = operators.some((op) => "syntax" in op);

  // Filter operators based on search term
  const filteredOperators = operators.filter(
    (op) =>
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.desc.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">
          {hasTabularOperators ? "Tabular Operators" : "Scalar Operators"}
        </h1>
        <p className="text-muted-foreground">
          Browse and search all available{" "}
          {hasTabularOperators ? "tabular" : "scalar"} operators for use in your
          queries.
        </p>

        <div className="relative max-w-sm">
          <Input
            type="text"
            placeholder="Search operators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredOperators.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {`No operators found matching "${searchTerm}"`}
          </p>
        </div>
      ) : (
        filteredOperators
          .filter((operator) => operator.implemented)
          .map((operator, i) => (
            <Operator key={`${i}-${operator.name}`} operator={operator} />
          ))
      )}
    </div>
  );
}

interface OperatorProps {
  operator: ScalarOperator | TabularOperator;
}

export function Operator({ operator }: OperatorProps) {
  const isTabular = "syntax" in operator;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle id={operator.name} className="scroll-mt-20 text-xl">
              {operator.name}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">{operator.desc}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {operator.examples?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Examples</h2>
            <Tabs defaultValue={`${operator.name}-example-0`}>
              <TabsList className="w-full justify-start">
                {operator.examples.map((example, i) => (
                  <TabsTrigger
                    key={`${operator.name}-tab-${i}`}
                    value={`${operator.name}-example-${i}`}
                  >
                    {example.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {operator.examples.map((example, i) => (
                <TabsContent
                  key={`${operator.name}-content-${i}`}
                  value={`${operator.name}-example-${i}`}
                  className="mt-4 space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Query</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CodeBlock code={example.query} language="kusto" />
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Input</CardTitle>
                        <CardDescription>Sample log entries</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted max-h-60 overflow-y-auto rounded-md p-4">
                          <pre className="text-xs">
                            {JSON.stringify(example.input, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Output</CardTitle>
                        <CardDescription>
                          Result after applying operator
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted max-h-60 overflow-y-auto rounded-md p-4">
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
      </CardContent>
    </Card>
  );
}

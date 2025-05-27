"use client";

import { ScalarFunc as ScalarFuncType } from "@/types/docs";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ScalarFuncIndex({ funcs }: { funcs: ScalarFuncType[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Group functions by category
  const functionsByCategory = funcs.reduce<Record<string, ScalarFuncType[]>>(
    (acc, func) => {
      const category = func.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(func);
      return acc;
    },
    {},
  );

  // Filter functions based on search term
  const filteredCategories = Object.keys(functionsByCategory).filter(
    (category) => {
      const categoryFuncs = functionsByCategory[category];
      return categoryFuncs.some(
        (func) =>
          func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          func.desc.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    },
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Scalar Functions</h1>
        <p className="text-muted-foreground">
          Browse and search all available scalar functions for use in your
          queries.
        </p>

        <div className="relative max-w-sm">
          <Input
            type="text"
            placeholder="Search functions..."
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

      {filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {`No functions found matching "{searchTerm}"`}
          </p>
        </div>
      ) : (
        filteredCategories.map((category) => {
          const categoryFuncs = functionsByCategory[category].filter(
            (func) =>
              func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              func.desc.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-semibold">{category}</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryFuncs.map((func) => (
                  <Link
                    key={func.name}
                    href={`/docs/reference/functions/scalar/${func.name}`}
                    className="transition-transform hover:scale-[1.01]"
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{func.name}</CardTitle>
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
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {func.desc}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="bg-muted w-full overflow-hidden rounded px-2 py-1 text-ellipsis whitespace-nowrap">
                          <code className="text-xs">{func.usage}</code>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

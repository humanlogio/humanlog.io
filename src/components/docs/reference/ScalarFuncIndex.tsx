"use client";

import { ScalarFunc as ScalarFuncType } from "@/types/docs";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Func } from "@/components/docs/reference/funcs/Func";

export function ScalarFuncIndex({ funcs }: { funcs: ScalarFuncType[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Scroll to hash element when component mounts
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  // Filter functions based on search term
  const filteredFuncs = funcs.filter(
    (func) =>
      func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.desc.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full max-w-full space-y-8">
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

      {filteredFuncs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {`No functions found matching "${searchTerm}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredFuncs
            .filter((func) => func.implemented)
            .map((func) => (
              <div
                key={`function-${func.name}`}
                id={func.name}
                className="scroll-mt-20"
              >
                <Func func={func} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

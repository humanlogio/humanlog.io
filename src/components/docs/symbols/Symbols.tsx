"use client";

import { Symbol } from "@/types/docs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Symbols({ symbols }: { symbols: Symbol[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Group symbols by their type
  const symbolsByType = symbols.reduce<Record<string, Symbol[]>>(
    (acc, symbol) => {
      if (!acc[symbol.type]) {
        acc[symbol.type] = [];
      }
      acc[symbol.type].push(symbol);
      return acc;
    },
    {},
  );

  // Filter symbols based on search term
  const filteredSymbols = symbols.filter(
    (symbol) =>
      symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort symbols alphabetically by name
  const sortedSymbols = [...filteredSymbols].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Symbol Reference</h1>
        <p className="text-muted-foreground">
          Browse and search all available symbols that can be used in queries.
        </p>

        <div className="relative max-w-sm">
          <Input
            type="text"
            placeholder="Search symbols..."
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

      {searchTerm ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSymbols.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Symbol</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSymbols.map((symbol, i) => (
                    <TableRow key={`${i}-${symbol.name}`}>
                      <TableCell className="font-mono font-medium">
                        {symbol.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {symbol.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{symbol.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  {`No symbols found matching "{searchTerm}"`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Show symbols grouped by type when not searching
        Object.entries(symbolsByType).map(([type, typeSymbols]) => (
          <Card key={type} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="capitalize">{type}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Symbol</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeSymbols
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((symbol, i) => (
                      <TableRow key={`${i}-${symbol.name}`}>
                        <TableCell className="font-mono font-medium">
                          {symbol.name}
                        </TableCell>
                        <TableCell>{symbol.desc}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

import { BinaryOp_Operator, Expr } from "api/js/types/v1/query_pb";
import { create } from "zustand";

export interface FilterBySymbol {
  symbolName: Expr;
  symbolValue: Expr;
  op?: BinaryOp_Operator;
}

interface FilterBySymbolStore {
  filterBySymbol: FilterBySymbol | null;
  setFilterBySymbol: (filterBySymbol: FilterBySymbol) => void;
}

export const useFilterBySymbolStore = create<FilterBySymbolStore>()((set) => ({
  filterBySymbol: null,
  setFilterBySymbol: (filterBySymbol) => set({ filterBySymbol }),
}));

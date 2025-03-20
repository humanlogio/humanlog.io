import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { SheetTitle } from "@/components/ui/sheet";
import { RecentQuery } from "./recent-query";
import { SavedQuery } from "./saved-query";
import { SymbolList } from "./symbol-list";

interface QueryLibraryProps {
  onClickSymbol: (symbolString: string) => void;
}

type tabsType = "symbols" | "saved" | "recent";

const tabs: { name: tabsType; text: string }[] = [
  { name: "symbols", text: "Symbol List" },
  { name: "saved", text: "Saved" },
  { name: "recent", text: "Recent" },
];

export const QueryLibrary = ({ onClickSymbol }: QueryLibraryProps) => {
  const [activeTab, setActiveTab] = useState<tabsType>("symbols");
  return (
    <div className="">
      <p className="mb-4 flex">
        {tabs.map((list) => {
          return (
            <button
              key={list.name}
              className={twMerge(
                "px-4 py-2 text-sm font-medium",
                activeTab === list.name
                  ? "border-b-2 border-main text-main"
                  : "text-gray-500 hover:text-gray-700",
              )}
              onClick={() => setActiveTab(list.name)}
            >
              {list.text}
            </button>
          );
        })}
      </p>
      <div className="">
        {activeTab === "symbols" && (
          <SymbolList onClickSymbol={onClickSymbol} />
        )}
        {activeTab === "saved" && <SavedQuery />}
        {activeTab === "recent" && <RecentQuery />}
      </div>
    </div>
  );
};

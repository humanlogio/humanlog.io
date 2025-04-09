import { useApiClients } from "@/context/api-provider";
import { ConnectError } from "@connectrpc/connect";
import { ListSymbolsResponse_ListItem } from "api/js/svc/query/v1/service_pb";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface SymbolTreeNode {
  name: string;
  fullPath: string;
  type?: any;
  children: Record<string, SymbolTreeNode>;
  isLeaf: boolean;
}

interface SymbolListProps {
  onClickSymbol: (symbolString: string) => void;
}

export const SymbolList = ({ onClickSymbol }: SymbolListProps) => {
  const searchParams = useSearchParams();
  const { apiClients, activeEnvironment } = useApiClients();
  const [symbolTree, setSymbolTree] = useState<Record<string, SymbolTreeNode>>(
    {},
  );
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  const buildSymbolTree = (symbols: ListSymbolsResponse_ListItem[]) => {
    const tree: Record<string, SymbolTreeNode> = {};

    symbols.forEach((item) => {
      const fullPath = item.symbol?.name || "";
      const parts = fullPath.split(".");

      let currentLevel = tree;
      let currentPath = "";

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}.${part}` : part;

        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            fullPath: currentPath,
            children: {},
            isLeaf: index === parts.length - 1,
          };
        }

        if (index === parts.length - 1) {
          currentLevel[part].type = item.symbol?.type;
        }

        currentLevel = currentLevel[part].children;
      });
    });

    return tree;
  };

  const getListSymbols = useCallback(async () => {
    try {
      const res = await apiClients?.query.listSymbols({
        environmentId: activeEnvironment?.id,
        limit: 100,
      });
      if (res) {
        const { items } = res;
        const tree = buildSymbolTree(items);

        setSymbolTree(tree);

        const initialExpandState: Record<string, boolean> = {};
        Object.keys(tree).forEach((key) => {
          initialExpandState[key] = true;
        });

        setExpandedNodes(initialExpandState);
      }
    } catch (error) {
      if (error instanceof ConnectError) toast.error(error.message);

      throw error;
    }
  }, [activeEnvironment]);

  const toggleNode = (nodePath: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodePath]: !prev[nodePath],
    }));
  };

  const getTypeString = (type: any) => {
    if (type) {
      const { value: typeValue } = type.type;
      switch (typeValue) {
        case 0:
          return "unknown";
        case 1:
          return "str";
        case 2:
          return "bool";
        case 3:
          return "i64";
        case 4:
          return "f64";
        case 5:
          return "timestamp";
        case 6:
          return "duration";
        default:
          return `scalar(${typeValue})`;
      }
    }
    return "unknown";
  };

  useEffect(() => {
    getListSymbols();
  }, [getListSymbols]);

  const renderTreeNode = (
    node: SymbolTreeNode,
    isRoot: boolean = false,
    level: number = 0,
  ) => {
    const isExpanded = expandedNodes[node.fullPath] || false;
    const hasChildren = Object.keys(node.children).length > 0;

    const onClickNode = (fullPath: string) => {
      if (!node.isLeaf) {
        toggleNode(fullPath);
        return;
      }
      onClickSymbol(fullPath);
    };

    return (
      <div
        key={node.fullPath}
        className={`${isRoot ? "mb-2" : ""}`}
        style={{ marginLeft: isRoot ? 0 : 16 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex cursor-pointer items-center rounded p-1",
                  node.isLeaf && "hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
                onClick={() => onClickNode(node.fullPath)}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  ) : (
                    <ChevronRight className="mr-1 h-3 w-3" />
                  )
                ) : (
                  <span className="mr-1 flex h-3 w-3 items-center justify-center text-gray-500">
                    •
                  </span>
                )}

                <span className="font-mono text-sm">{node.name}</span>

                {node.isLeaf && (
                  <span className="ml-2 rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-600">
                    {getTypeString(node.type)}
                  </span>
                )}
              </div>
            </TooltipTrigger>

            {node.isLeaf && (
              <TooltipContent className="dark:bg-secondaryBlack bg-white">
                <div>{node.fullPath}</div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700">
            {Object.values(node.children).map((childNode) =>
              renderTreeNode(childNode, false, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-150px)] w-full overflow-y-auto p-2">
      {Object.values(symbolTree).map((node) => renderTreeNode(node, true))}
    </div>
  );
};

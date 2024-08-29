import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Search } from "lucide-react";
import {
  ImperativePanelGroupHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Fragment, useEffect, useRef } from "react";

import { DragHandle, SortableItem } from "@/components/sortable/sortable-item";
import { Button } from "@/components/ui/button";

type ContainerProps = {
  id: string;
  items: UniqueIdentifier[];
};

const SessionGroup = ({ id, items = [] }: ContainerProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const layoutMapRef = useRef<Map<UniqueIdentifier, number>>(new Map());

  const onLayout = (sizes: number[]) => {
    const layoutMap = layoutMapRef.current;
    items.forEach((item, index) => {
      const size = sizes[index];
      layoutMap.set(item, size);
    });
  };

  useEffect(() => {
    const layoutMap = layoutMapRef.current;
    if (layoutMap.size === 0) {
      return; // Initial render
    }

    const panelGroup = panelGroupRef.current;
    if (panelGroup) {
      const sizes = items.map((item) => layoutMap.get(item)!);
      panelGroup.setLayout(sizes);
    }
  }, [items]);

  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <div ref={setNodeRef} className="flex-grow">
        <PanelGroup
          direction="horizontal"
          onLayout={onLayout}
          ref={panelGroupRef}
          style={{ overflow: "initial" }}
        >
          {items.map((item, index) => {
            return (
              <Fragment key={item}>
                <Panel
                  id={`${item}`}
                  order={index}
                  style={{ overflow: "initial", minWidth: 0 }}
                >
                  <SortableItem id={item}>
                    <div className="flex h-full flex-col overflow-hidden rounded-base border-2 border-border bg-secondary-900">
                      <div className="flex flex-none flex-row items-center justify-between bg-secondary-100 px-4 py-2">
                        <div className="flex w-1/3 justify-start">
                          <h4 className="font-bold text-white">Session</h4>
                        </div>
                        <div className="flex w-1/3 justify-center">
                          <DragHandle />
                        </div>
                        <div className="flex w-1/3 justify-end">
                          <Button size="icon" className="mb-1 h-8">
                            <Search size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-grow flex-col text-sm">
                        <div className="flex flex-row items-center">
                          <div className="text-gray-500">1</div>
                          <div className="text-white">{item}</div>
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                </Panel>
                {index !== items.length - 1 && (
                  <PanelResizeHandle>
                    <div className="flex h-full items-center justify-center px-1">
                      <div className="h-12 w-1 rounded-full bg-gray-700" />
                    </div>
                  </PanelResizeHandle>
                )}
              </Fragment>
            );
          })}
        </PanelGroup>
      </div>
    </SortableContext>
  );
};
export default SessionGroup;

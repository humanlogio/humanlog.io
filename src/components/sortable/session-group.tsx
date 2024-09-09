import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import {
  ImperativePanelGroupHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Fragment, useEffect, useRef } from "react";

import { SortableItem } from "@/components/sortable/sortable-item";
import { LogEventGroup } from "@/components/sortable/session-container";
import SessionPanel from "@/components/sortable/session-panel";

type ContainerProps = {
  id: string;
  items: UniqueIdentifier[];
  lookupSession: (id: UniqueIdentifier) => LogEventGroup | undefined;
};

const SessionGroup = ({ id, items = [], lookupSession }: ContainerProps) => {
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
      <div ref={setNodeRef} className="flex flex-grow flex-col overflow-hidden">
        <PanelGroup
          direction="horizontal"
          onLayout={onLayout}
          ref={panelGroupRef}
          style={{ overflow: "initial", flexGrow: 1 }}
        >
          {items.map((item, index) => {
            let logEventGroup = lookupSession(item);
            return (
              <Fragment key={item}>
                <Panel
                  id={`${item}`}
                  order={index}
                  defaultSize={100 / items?.length}
                  style={{
                    overflow: "initial",
                    minWidth: 0,
                  }}
                >
                  <SortableItem id={item}>
                    <SessionPanel logEventGroup={logEventGroup} />
                  </SortableItem>
                </Panel>
                {index !== items.length - 1 && (
                  <PanelResizeHandle>
                    <div className="flex h-full items-center justify-center px-1">
                      <div className="h-12 w-1 rounded-full bg-slate-700" />
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

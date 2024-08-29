import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";

import {
  ImperativePanelGroupHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Fragment, useEffect, useRef } from "react";
import { DragHandle, SortableItem } from "@/components/sortable/sortable-item";
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
      <div
        ref={setNodeRef}
        style={{
          padding: "24px",
          border: "1px solid",
          borderColor: "$catskillWhite",
          borderRadius: "$2xl",
        }}
      >
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
                    <div
                      style={{
                        position: "relative",
                        border: "1px solid black",
                        height: "200px",
                      }}
                    >
                      {item}
                      <DragHandle />
                    </div>
                  </SortableItem>
                </Panel>
                {index !== items.length - 1 && (
                  <PanelResizeHandle>
                    <div
                      style={{
                        width: "10px",
                        height: "100%",
                        background: "$catskillWhite",
                        borderRadius: "$round",
                      }}
                    />
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

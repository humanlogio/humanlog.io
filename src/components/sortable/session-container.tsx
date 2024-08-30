import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import SessionGroup from "@/components/sortable/session-group";
import { SortableOverlay } from "@/components/sortable/sortable-overlay";
import { SortableItem } from "@/components/sortable/sortable-item";
import { Timestamp } from "@bufbuild/protobuf";
import SessionPanel from "@/components/sortable/session-panel";

// Define a type for the session item
export type LogEventGroup = {
  id: UniqueIdentifier; // "${machineId}-${sessionId}"
  machineId: number;
  sessionId: number;
  logs: LogEvent[];
};

export type LogEvent = {
  id: number;
  parseAt: Timestamp;
  raw: string;
  structured: {
    timestamp: Timestamp;
    lvl: string; // INFO/ERROR/...
    msg: string;
    kvs: KV[];
  };
};

export type KV = {
  key: string;
  value: string;
};

const SessionContainer = () => {
  const [items, setItems] = useState<{ [key: string]: LogEventGroup[] }>({
    root: [
      {
        id: "2-42",
        machineId: 2,
        sessionId: 42,
        logs: [
          {
            id: 1,
            parseAt: new Timestamp({ seconds: BigInt(1724914754) }),
            raw: "hello world gtgtg",
            structured: {
              timestamp: new Timestamp({ seconds: BigInt(1724914754) }),
              msg: "hello world",
              lvl: "info",
              kvs: [{ key: "key1", value: "value1" }],
            },
          },
        ],
      },
      {
        id: "2-43",
        machineId: 2,
        sessionId: 43,
        logs: [
          {
            id: 1,
            parseAt: new Timestamp({ seconds: BigInt(1724914754) }),
            raw: "gg!!!",
            structured: {
              timestamp: new Timestamp({ seconds: BigInt(1724914754) }),
              msg: "gg",
              lvl: "info",
              kvs: [{ key: "key1", value: "value1" }],
            },
          },
        ],
      },
      {
        id: "1-64",
        machineId: 1,
        sessionId: 64,
        logs: [
          {
            id: 1,
            parseAt: new Timestamp({ seconds: BigInt(1724914754) }),
            raw: "salut le monde gtgtg",
            structured: {
              timestamp: new Timestamp({ seconds: BigInt(1724914754) }),
              msg: "salut le monde",
              lvl: "info",
              kvs: [{ key: "key1", value: "value1" }],
            },
          },
          {
            id: 553,
            parseAt: new Timestamp({ seconds: BigInt(1724914754) }),
            raw: "much later this happened",
            structured: {
              timestamp: new Timestamp({ seconds: BigInt(1724914754) }),
              msg: "much latter this happened",
              lvl: "info",
              kvs: [{ key: "key1", value: "value1" }],
            },
          },
        ],
      },
    ],
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items,
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.find((el) => el.id === container.id),
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items],
  );
  const onDragCancel = () => {
    if (items) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(items);
    }

    setActiveId(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].find((el) => el.id === id),
    );
  };

  return (
    <DndContext
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragCancel={onDragCancel}
      onDragStart={({ active }) => {
        setActiveId(active.id);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        if (overId == null || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = overItems.findIndex((el) => el.id === overId);
            const activeIndex = activeItems.findIndex(
              (el) => el.id === active.id,
            );

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top >
                  over.rect.top + over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (item) => item.id !== active.id,
              ),
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(
                  newIndex,
                  items[overContainer].length,
                ),
              ],
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = items[activeContainer].findIndex(
            (el) => el.id === active.id,
          );
          const overIndex = items[overContainer].findIndex(
            (el) => el.id === overId,
          );

          if (activeIndex !== overIndex) {
            setItems((items) => ({
              ...items,
              [overContainer]: arrayMove(
                items[overContainer],
                activeIndex,
                overIndex,
              ),
            }));
          }
        }

        setActiveId(null);
      }}
      collisionDetection={collisionDetectionStrategy}
      sensors={sensors}
    >
      <div className="flex flex-grow flex-col">
        {Object.keys(items).map((key) => (
          <SessionGroup
            key={key}
            items={items[key].map((el) => el.id)}
            lookupSession={(id) => items["root"].find((el) => el.id == id)}
            id={key}
          />
        ))}
      </div>
      <SortableOverlay>
        {activeId && (
          <SortableItem id={activeId}>
            <SessionPanel
              logEventGroup={items["root"].find((el) => el.id == activeId)}
            />
          </SortableItem>
        )}
      </SortableOverlay>
    </DndContext>
  );
};

export default SessionContainer;

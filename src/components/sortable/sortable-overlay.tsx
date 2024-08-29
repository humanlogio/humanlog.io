import type { ReactNode } from "react";
import { DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import type { DropAnimation } from "@dnd-kit/core";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export function SortableOverlay({ children }: { children: ReactNode }) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}

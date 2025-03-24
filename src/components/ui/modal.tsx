import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface ModalProps {
  open?: boolean;
  children: ReactNode;
}

export const Modal = ({ open = true, children }: ModalProps) => {
  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 text-center text-black shadow-lg dark:bg-darkBg dark:text-white">
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

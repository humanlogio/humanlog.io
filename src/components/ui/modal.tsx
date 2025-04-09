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
        <DialogContent className="dark:bg-darkBg fixed top-1/2 left-1/2 z-50 max-h-[90%] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-8 text-center text-black shadow-lg dark:text-white">
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

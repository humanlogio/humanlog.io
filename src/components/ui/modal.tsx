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
        <DialogOverlay className="fixed inset-0 bg-black/40 dark:bg-black/60" />
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

import { toast } from "sonner";

export const copyToClipboard = (value: string, text?: string) => {
  navigator.clipboard
    .writeText(value)
    .then(() => {
      toast.success(`${text ? text : "Text"} copied to clipboard`);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

import { toast } from "sonner";

export const copyToClipboard = async (value: string, text?: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${text ? text : "Text"} copied to clipboard`);
    return true;
  } catch (error) {
    console.error("Failed to copy text: ", error);
    return false;
  }
};

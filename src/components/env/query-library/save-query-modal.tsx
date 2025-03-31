import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { useApiClients } from "@/context/api-provider";
import { Dispatch, SetStateAction, useEffect } from "react";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/ui/markdown-textarea";
import MonacoEditor from "@/components/editor/monaco-editor";

interface SaveQueryModalProps {
  query: string;
  isSaveQueryModalOpen: boolean;
  setIsSaveQueryModalOpen: Dispatch<SetStateAction<boolean>>;
  parsedQuery?: LogQuery;
}

const formSchema = z.object({
  query: z.string(),
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SaveQueryModal = ({
  query,
  isSaveQueryModalOpen,
  setIsSaveQueryModalOpen,
  parsedQuery,
}: SaveQueryModalProps) => {
  const { apiClients } = useApiClients();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query,
      name: "",
      note: "",
    },
  });

  const onSubmit = (formData: FormValues) => {
    try {
      if (query) {
        const { query, name, note } = formData;
        apiClients?.user.createFavoriteQuery({
          name,
          rawQuery: query,
          ...(note && { note }),
          ...(parsedQuery && { query: parsedQuery }),
        });
        toast.success(`Query ${name} saved`);
        console.log("query", query);
      }
    } catch (error) {
      if (error instanceof ConnectError) toast.error(error.message);
    } finally {
      setIsSaveQueryModalOpen(false);
    }
  };

  useEffect(() => {
    if (!isSaveQueryModalOpen) {
      form.reset({
        query,
        name: "",
        note: "",
      });
    }
  }, [isSaveQueryModalOpen, form, query]);

  return (
    <Modal open={isSaveQueryModalOpen}>
      <DialogHeader>
        <DialogTitle></DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    autoComplete="off"
                    placeholder="Give your query a name..."
                    className="w-full"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="query"
            render={({ field, fieldState }) => (
              <FormItem className="mt-4 flex flex-col items-start">
                <FormLabel>Query</FormLabel>
                <FormControl>
                  <div className="w-full overflow-hidden rounded-base border-2 border-border py-3">
                    <MonacoEditor {...field} value={field.value || ""} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="mt-4 flex flex-col items-start">
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <MarkdownEditor
                    id="query-note"
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Add optional notes or description (supports Markdown)"
                    label=""
                    error={form.formState.errors.note?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="mt-4 flex-row">
            <Button size="sm" onClick={() => setIsSaveQueryModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={!form.formState.errors}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
};

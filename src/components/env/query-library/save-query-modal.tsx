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

interface SaveQueryModalProps {
  queryString: string;
  isSaveQueryModalOpen: boolean;
  setIsSaveQueryModalOpen: Dispatch<SetStateAction<boolean>>;
  parsedQuery?: LogQuery;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SaveQueryModal = ({
  queryString,
  isSaveQueryModalOpen,
  setIsSaveQueryModalOpen,
  parsedQuery,
}: SaveQueryModalProps) => {
  const { apiClients } = useApiClients();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      note: "",
    },
  });

  const onSubmit = (formData: FormValues) => {
    try {
      if (queryString) {
        const { name, note } = formData;
        apiClients?.user.createFavoriteQuery({
          name,
          rawQuery: decodeURIComponent(queryString),
          ...(note && { note }),
          ...(parsedQuery && { query: parsedQuery }),
        });
        toast.success(`Query ${name} saved`);
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
        name: "",
        note: "",
      });
    }
  }, [isSaveQueryModalOpen, form]);

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

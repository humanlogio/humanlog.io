import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { useApiClients } from "@/context/api-provider";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { Loader } from "lucide-react";
import { Cursor } from "api/js/types/v1/cursor_pb";

interface SaveQueryModalProps {
  id?: bigint;
  query?: string;
  isSaveQueryModalOpen: boolean;
  setIsSaveQueryModalOpen: Dispatch<SetStateAction<boolean>>;
  parsedQuery?: LogQuery;
  refetch?: () => void;
}

const formSchema = z.object({
  query: z.string(),
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SaveQueryModal = ({
  id,
  query,
  refetch,
  isSaveQueryModalOpen,
  setIsSaveQueryModalOpen,
  parsedQuery,
}: SaveQueryModalProps) => {
  const { apiClients } = useApiClients();

  const fetchSavedQueries = useCallback(
    async ({ cursor, limit }: { cursor: Cursor | null; limit: number }) => {
      const res = await apiClients?.user.listFavoriteQuery({
        ...(cursor && { cursor }),
        limit,
      });
      return {
        items: res?.items || [],
        next: res?.next || null,
      };
    },
    [apiClients?.user],
  );

  const [isFetching, setIsFetching] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query,
      name: "",
      note: "",
    },
  });

  const getFavoriteQuery = useCallback(async () => {
    if (!id) return;
    try {
      setIsFetching(true);
      const res = await apiClients?.user.getFavoriteQuery({ id });
      form.reset({
        query: res?.favorite?.rawQuery ?? "",
        name: res?.favorite?.name ?? "",
        note: res?.favorite?.note ?? "",
      });
    } catch (error) {
      if (error instanceof ConnectError) toast.error(error.message);
    } finally {
      setIsFetching(false);
    }
  }, [isSaveQueryModalOpen]);

  const onSubmit = async (formData: FormValues) => {
    const { query, name, note } = formData;

    const requestForm = {
      name,
      rawQuery: query,
      ...(note && { note }),
      ...(parsedQuery && { query: parsedQuery }),
      ...(id && { id }),
    };

    try {
      if (id) {
        await apiClients?.user.updateFavoriteQuery(requestForm);
      } else {
        await apiClients?.user.createFavoriteQuery(requestForm);
      }
      refetch && refetch();
      toast.success(
        <p>
          Saved query <strong>{name}</strong>
        </p>,
      );
    } catch (error) {
      if (error instanceof ConnectError) toast.error(error.message);
    } finally {
      setIsSaveQueryModalOpen(false);
    }
  };

  useEffect(() => {
    getFavoriteQuery();
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
      {isFetching ? (
        <Loader className="animate-spin" />
      ) : (
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
                    <div className="rounded-base border-border w-full overflow-hidden border-2 py-3">
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
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setIsSaveQueryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                // variant="noShadow"
                size="sm"
                type="submit"
                disabled={!form.formState.errors}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </Modal>
  );
};

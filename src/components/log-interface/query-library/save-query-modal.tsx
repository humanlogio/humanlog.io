import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
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
import { Query } from "api/js/types/v1/query_pb";
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
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@/components/editor/monaco-editor"),
  { ssr: false },
);

interface SaveQueryModalProps {
  id?: bigint;
  query?: string;
  isSaveQueryModalOpen: boolean;
  setIsSaveQueryModalOpen: Dispatch<SetStateAction<boolean>>;
  parsedQuery?: Query;
  setSavedQueryId?: Dispatch<SetStateAction<bigint | undefined>>;
}

const formSchema = z.object({
  query: z.string(),
  name: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SaveQueryModal = ({
  id,
  query,
  isSaveQueryModalOpen,
  setIsSaveQueryModalOpen,
  parsedQuery,
  setSavedQueryId,
}: SaveQueryModalProps) => {
  const { apiClients } = useApiClients();

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
        setSavedQueryId && setSavedQueryId(id);
      } else {
        const res = await apiClients?.user.createFavoriteQuery(requestForm);
        setSavedQueryId && setSavedQueryId(res?.favorite?.id as bigint);
      }

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
    <Dialog open={isSaveQueryModalOpen} onOpenChange={setIsSaveQueryModalOpen}>
      <DialogContent className="overflow-hidden md:max-w-4xl">
        <DialogTitle />
        {isFetching ? (
          <Loader className="animate-spin" />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              autoComplete="off"
              className="space-y-4 overflow-hidden"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel>Query</FormLabel>
                    <FormControl>
                      <div className="w-full max-w-full overflow-hidden rounded-md border py-3">
                        <MonacoEditor {...field} value={field.value || ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        className="w-full max-w-full"
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
                  <FormItem className="flex flex-col items-start">
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <div className="w-full max-w-full">
                        <MarkdownEditor
                          id="query-note"
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Add optional notes or description (supports Markdown)"
                          label=""
                          error={form.formState.errors.note?.message}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaveQueryModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
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
      </DialogContent>
    </Dialog>
  );
};

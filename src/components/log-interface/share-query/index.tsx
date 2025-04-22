import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApiClients } from "@/context/api-provider";
import { createUserSharedResult } from "@/services/shareService";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Data } from "api/js/types/v1/data_pb";
import { SharedResultVisibility } from "api/js/types/v1/shared_result_pb";
import { Share, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/services/userService";
import { useState } from "react";
import { useAllEnvironments } from "@/context/list-environments";
import { toast } from "sonner";

interface ShareQueryProps {
  queryHistoryEntry?: QueryHistoryEntry;
  data?: Data;
}

export const ShareQuery = ({ queryHistoryEntry, data }: ShareQueryProps) => {
  const { user } = useAllEnvironments();
  const { apiClients } = useApiClients();

  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(
    user === "loading" || user === "not-logged-in" ? false : !!user.username,
  );

  const handleUpdateUser = async () => {
    if (user === "loading" || user === "not-logged-in" || !apiClients) return;
    await updateUser(apiClients.user, user.firstName, user.lastName, username, {
      onSuccess: () => {
        toast.success("Username successfully updated");
        setIsValid(true);
      },
      onError: () => setIsValid(false),
    });
  };

  const handleShareQuery = async (visibility: SharedResultVisibility) => {
    if (!apiClients) return;
    await createUserSharedResult(
      apiClients.userShare,
      queryHistoryEntry,
      data,
      visibility,
      {
        onSuccess: (res) => console.log("res", res),
        onError: (error) => {},
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!data} size="xs" variant="outline">
          <Share size={12} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Query</DialogTitle>
          <div className="space-y-3">
            <div>
              Create a permanent link to share your query with others. Anyone
              with this link will be able to view and run this query.
            </div>

            {!isValid && (
              <div>
                <Label>Pick a username</Label>
                <div className="flex w-full gap-2">
                  <Input onChange={(e) => setUsername(e.target.value)} />
                  <Button
                    disabled={username.length === 0}
                    onClick={handleUpdateUser}
                  >
                    Save
                  </Button>
                </div>
                <p className="mt-1 text-xs text-red-400">
                  You need a userinfo to share query results.
                </p>
              </div>
            )}

            <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/30">
              <div>
                <div className="flex items-center gap-1">
                  <TriangleAlert
                    size={14}
                    aria-hidden="true"
                    className="text-yellow-400 dark:text-yellow-500"
                  />
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Warning
                  </h3>
                </div>

                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300/90">
                  {` When you share this query, it will be stored in our cloud
                  service. Make sure your query doesn't contain any sensitive
                  information.`}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={!isValid}
            onClick={() => handleShareQuery(SharedResultVisibility.PUBLIC)}
          >
            Public
          </Button>
          <Button
            disabled={!isValid}
            onClick={() =>
              handleShareQuery(SharedResultVisibility.ANYONE_WITH_LINK)
            }
          >
            Anyone with the link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApiClients } from "@/context/api-provider";
import { createUserSharedResult } from "@/services/shareService";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { SharedResultVisibility } from "api/js/types/v1/shared_result_pb";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/services/userService";
import { Dispatch, SetStateAction, useState } from "react";
import { useAllEnvironments } from "@/context/list-environments";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { getSelfURL } from "@/lib/envs";
import { Data } from "api/js/types/v1/data_pb";

interface ShareQueryProps {
  queryHistoryEntry: QueryHistoryEntry;
  sharedData: Data | null;
  setSharedData: Dispatch<SetStateAction<Data | null>>;
}

export const ShareQuery = ({
  queryHistoryEntry,
  sharedData,
  setSharedData,
}: ShareQueryProps) => {
  const selfURL = getSelfURL();

  const { user } = useAllEnvironments();
  const { apiClients } = useApiClients();

  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(
    user === "loading" || user === "not-logged-in" ? false : !!user.username,
  );
  const [shareLink, setShareLink] = useState<string | null>();
  const [copied, setCopied] = useState(false);

  const handleUpdateUser = async () => {
    if (user === "loading" || user === "not-logged-in" || !apiClients) return;
    await updateUser(apiClients.user, user.firstName, user.lastName, username, {
      onSuccess: (res) => {
        if (res.user?.username) {
          toast.success("Username successfully updated");
          setIsValid(true);
        }
      },
      onError: () => setIsValid(false),
    });
  };

  const handleShareQuery = async (visibility: SharedResultVisibility) => {
    if (!apiClients || !sharedData) return;
    await createUserSharedResult(
      apiClients.userShare,
      queryHistoryEntry,
      sharedData,
      visibility,
      {
        onSuccess: (res) => {
          if (
            visibility === SharedResultVisibility.ANYONE_WITH_LINK &&
            res.sharedResult?.visibility.case === "anyoneWithLink"
          ) {
            const { randomPrefix, shareId } =
              res.sharedResult?.visibility.value;

            const link = `${selfURL}/share/private/${randomPrefix}/${shareId}`;
            setShareLink(link);
          } else if (
            visibility === SharedResultVisibility.PUBLIC &&
            res.sharedResult?.visibility.case === "public"
          ) {
            const { shareId } = res.sharedResult?.visibility.value;
            const link = `${selfURL}/share/public/${shareId}`;
            setShareLink(link);
          }
        },
      },
    );
  };

  const handleCopyToClipboard = async (value: string) => {
    const res = await copyToClipboard(value);
    if (res) {
      setCopied(true);
    } else {
      setCopied(false);
    }
  };

  const resetLink = () => {
    setShareLink(null);
    setCopied(false);
  };

  const onOpenChange = () => {
    resetLink();
    setSharedData(null);
  };

  return (
    <Dialog open={!!sharedData} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Results</DialogTitle>
          <div className="space-y-3">
            <div>
              Create a permanent link to share your query and the results with
              others.
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
                  You need a username to share query results.
                </p>
              </div>
            )}

            {shareLink && (
              <div className="mt-4">
                <Label htmlFor="share-link">Share Link</Label>
                <div className="mt-1 flex">
                  <Input
                    id="share-link"
                    readOnly
                    value={shareLink}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleCopyToClipboard(shareLink)}
                  >
                    {copied ? <Check className="text-green-500" /> : <Copy />}
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/30">
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
                  {`This will upload the query and the results to our cloud.`}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-end gap-2">
            {shareLink ? (
              <Button onClick={resetLink}>Create New Link</Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={!isValid}
                      onClick={() =>
                        handleShareQuery(SharedResultVisibility.PUBLIC)
                      }
                    >
                      Public
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={5}>
                    <p>Share with the public.</p>
                    <p>This will appear on your user profile page.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={!isValid}
                      onClick={() =>
                        handleShareQuery(
                          SharedResultVisibility.ANYONE_WITH_LINK,
                        )
                      }
                    >
                      Anyone with the link
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={5}>
                    <p>Share only to those who have the link.</p>
                    <p>This will not appear on your user profile page.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

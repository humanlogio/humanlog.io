"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function InvitationCallbackPage() {
  const router = useRouter();
  const { organization } = authClient;
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitationId");

  const { useSession } = authClient;
  const { data: session, isPending: isPendingSession } = useSession();

  const handleAcceptInvitation = async () => {
    await organization.acceptInvitation(
      {
        invitationId: invitationId || "",
      },
      {
        onSuccess: (ctx) => {
          organization.setActive({
            organizationId: ctx.data.organizationId,
          });
          router.push("/settings/org");
        },
        onError: (ctx) => {
          toast.error(`Failed to accept invitation: ${ctx.error.message}`);
        },
      },
    );
  };

  useEffect(() => {
    if (session || isPendingSession) return;
    router.push(
      `/sign-in?callbackUrl=/invitation-callback?invitationId=${invitationId}`,
    );
  }, [session, invitationId]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button onClick={handleAcceptInvitation}>Accept Invitation</Button>
    </div>
  );
}

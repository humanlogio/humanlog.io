"use client";
import LoadingIndicator from "@/components/loading-indicator";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function InvitationCallbackPage() {
  const router = useRouter();
  const { organization } = authClient;
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitationId");

  const { useSession, signOut } = authClient;
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
        onError: async (ctx) => {
          if (ctx.error.status === 403) {
            await signOut();
            router.push(
              `/sign-in?callbackUrl=/invitation-callback?invitationId=${invitationId}`,
            );
            return;
          }
          toast.error(`Failed to accept invitation: ${ctx.error.message}`);
        },
      },
    );
  };

  useEffect(() => {
    if (isPendingSession) return;
    if (!session) {
      toast.error("You need to log in to accept this invitation");
      router.push(
        `/sign-in?callbackUrl=/invitation-callback?invitationId=${invitationId}`,
      );
      return;
    }
    handleAcceptInvitation();
  }, [session, invitationId, isPendingSession]);

  return <LoadingIndicator />;
}

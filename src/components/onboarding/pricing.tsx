"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader, ArrowRight, CreditCard } from "lucide-react";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import { createAddonSubscription } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { Product_Scope } from "api/js/types/v1/product_pb";
import { ConnectError } from "@connectrpc/connect";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useEnvironmentStore } from "@/stores/environment-store";
import { usePageStore } from "@/stores/page-store";
import { useOrganizationStore } from "@/stores/user-store";

export default function OnboardingPricing() {
  const router = useRouter();
  const { activeEnvironment } = useEnvironmentStore();
  const { activePage } = usePageStore();
  const { currentOrganization } = useOrganizationStore();

  const { data: productData } = useQuery(listProduct, {
    category: "logging",
    scope: Product_Scope.Organization,
  });

  const { mutate: createAddonSubscriptionMutation, isPending } = useMutation(
    createAddonSubscription,
    {
      onSuccess: () => {
        toast.success("You're all set with the free plan.");
        const url = getOrgEnvUrl(
          currentOrganization,
          activeEnvironment,
          activePage,
        );
        router.push(url);
      },
      onError: (error) => {
        if (error instanceof ConnectError) {
          toast.error(`Subscription failed: ${error.message}`);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      },
    },
  );

  const handleStartFree = async () => {
    try {
      // Find the free personal use price
      const freePlan = productData?.items
        .flatMap((item) => item.prices)
        .find((price) => price.lookupKey === "free_personal_use");

      if (!freePlan) {
        toast.error("Free plan not found. Please try again.");
        return;
      }

      createAddonSubscriptionMutation({
        payment: {
          case: "stripe",
          value: {
            confirmationToken: "",
            priceId: freePlan.stripeId,
          },
        },
      });
    } catch (error) {
      console.error("Error subscribing to free plan:", error);
      if (error instanceof ConnectError) {
        toast.error(`Subscription failed: ${error.message}`);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
    }
  };

  const handleViewAllPlans = () => {
    router.push("/pricing");
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold dark:text-white">Choose Your Plan</h1>
        <p className="mt-2 text-gray-400">
          Get started quickly or explore all available options
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Button
          onClick={handleStartFree}
          disabled={isPending}
          className="h-12 w-full bg-emerald-500 text-base text-white hover:bg-emerald-700"
          size="lg"
        >
          {isPending ? (
            <Loader className="mr-2 animate-spin" size={16} />
          ) : (
            <CreditCard className="mr-2" size={16} />
          )}
          {isPending ? "Setting up..." : "Start with Free Plan"}
        </Button>

        <Button
          onClick={handleViewAllPlans}
          variant="outline"
          className="h-12 w-full text-base"
          size="lg"
        >
          <ArrowRight className="mr-2" size={16} />
          View All Plans & Features
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          You can always upgrade or change your plan later
        </p>
      </div>
    </>
  );
}

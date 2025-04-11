import { EnvironmentCreationForm } from "@/components/env/env-creation-form";
import config from "@/features/config";
import { notFound } from "next/navigation";

export default function NewEnvironmentPage() {
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  if (isProd) {
    notFound();
  }

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={null} />
    </div>
  );
}

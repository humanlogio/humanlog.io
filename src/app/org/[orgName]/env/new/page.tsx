import { EnvironmentCreationForm } from "@/components/forms/environment-creation-form";

interface NewOrgEnvironmentPageProps {
  params: Promise<{
    orgName: string;
  }>;
}

export default async function NewOrgEnvironmentPage(
  props: NewOrgEnvironmentPageProps,
) {
  const params = await props.params;
  return (
    <div className="container-h-full container py-6">
      <h1 className="mb-6 text-3xl font-bold">
        Create New Environment for {params.orgName}
      </h1>
      <EnvironmentCreationForm orgId={params.orgName} />
    </div>
  );
}

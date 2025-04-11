import { EnvironmentCreationForm } from "@/components/env/env-creation-form";

export default function NewEnvironmentPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={null} />
    </div>
  );
}

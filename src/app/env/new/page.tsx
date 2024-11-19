import { EnvironmentCreationForm } from "@/components/forms/EnvironmentCreationForm";

export default function NewEnvironmentPage() {
  return (
    <div className="container-h-full container py-6">
      <h1 className="mb-6 text-3xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={null} />
    </div>
  );
}

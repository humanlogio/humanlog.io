import { EnvironmentCreationForm } from "@/components/forms/EnvironmentCreationForm";

export default function NewEnvironmentPage() {
  return (
    <div className="container min-h-[calc(100dvh-56px)] py-8">
      <h1 className="mb-6 text-4xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={null} />
    </div>
  );
}

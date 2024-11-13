import { EnvironmentCreationForm } from "@/components/forms/EnvironmentCreationForm";

export default function NewEnvironmentPage() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-56px)] w-full max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={null} />
    </div>
  );
}

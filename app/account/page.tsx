import { getUser } from "@/lib/auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share, UserX2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export async function Account() {
  const { user } = await getUser();
  const userFields = user && [
    ["First name", user.firstName],
    ["Last name", user.lastName],
    ["Email", user.email],
    ["Id", user.id],
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <h1 className="text-xl font-semibold">Account</h1>
        <TooltipProvider>
          <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 text-sm"
            >
              <UserX2 className="size-3.5" />
            </Button>
            </TooltipTrigger>
            <TooltipContent>Log out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative hidden flex-col items-start gap-8 md:flex">
          {userFields && (
            <form className="grid w-full items-start gap-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                {userFields.map(([label, value]) => (
                  <label>
                    <legend className="-ml-1 px-1 text-sm font-medium">
                      {label}
                    </legend>
                    <div className="grid gap-3">
                      <Input value={value || ""} readOnly />
                    </div>
                  </label>
                ))}
              </fieldset>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

export default Account;
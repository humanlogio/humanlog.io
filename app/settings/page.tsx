
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bird, Rabbit, Turtle } from "lucide-react";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import { getUser } from "@workos-inc/authkit-nextjs";

export default async function Dashboard() {
  
  // const user = await getUser()

  return (
    <div>
      <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
      
      <div className="relative hidden flex-col items-start gap-8 md:flex">
          <form className="grid w-full items-start gap-6">
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Account
              </legend>
            </fieldset>
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Billing
              </legend>
              <div className="grid gap-3">
                <Label htmlFor="model">Plan</Label>
                <Input></Input>
              </div>
            </fieldset>
          </form>
        </div>
      </main>
    </div>
  );
}

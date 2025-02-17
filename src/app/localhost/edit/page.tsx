"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useApiClients } from "@/context/api-provider";

const Edit = () => {
  const { apiClients, setActiveEnvironment } = useApiClients();

  const formSchema = z.object({
    timeFormat: z.string().optional(),
    timeZone: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { timeFormat: "", timeZone: "" },
  });

  /** huamnlog version update */
  const doUpdate = async () => {
    try {
      const res = await apiClients?.localhost.doUpdate({});
      console.log("doUpdate res", res);
    } catch (err) {
      console.log("err", err);
    }
  };

  /** humanlog service restart */
  const doRestart = async () => {
    try {
      const res = await apiClients?.localhost.doRestart({});
      console.log("doRestart res", res);
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <div className="flex w-full justify-center">
      <div className="mt-4">
        <div className="mt-10 flex gap-4">
          <Button onClick={doUpdate}>Do Update</Button>
          <Button onClick={doRestart}>Restart</Button>
        </div>
      </div>
    </div>
  );
};

export default Edit;

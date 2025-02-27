import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const ToggleShowPretty = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pretty = searchParams.get("pretty");

  const onCheckedChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("pretty", "true");
      router.push(`?${params}`);
    } else {
      params.set("pretty", "false");
      router.push(`?${params}`);
    }
  };

  return (
    <div className="container flex items-center gap-2">
      <Switch
        id="show-pretty"
        checked={pretty === "false" ? false : true}
        onCheckedChange={(e) => onCheckedChange(e)}
      />
      <Label
        htmlFor="show-pretty"
        className={cn("relative transition-colors duration-200", {
          "text-slate-500": !(pretty === "false" ? false : true),
        })}
      >
        Pretty
      </Label>
    </div>
  );
};

export const ToggleSplit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const split = searchParams.get("splitByDefault");

  const onCheckedChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("splitByDefault", "true");
      router.push(`?${params}`);
    } else {
      params.set("splitByDefault", "false");
      router.push(`?${params}`);
    }
  };

  return (
    <div className="container flex items-center gap-2">
      <Switch
        id="split-by-default"
        checked={split === "false" ? false : true}
        onCheckedChange={(e) => onCheckedChange(e)}
      />
      <Label
        htmlFor="split-by-default"
        className={cn("relative transition-colors duration-200", {
          "text-slate-500": !(split === "false" ? false : true),
        })}
      >
        Split by Default
      </Label>
    </div>
  );
};

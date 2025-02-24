"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { useApiClients } from "@/context/api-provider";
import { SquareCode, User as UserIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { SettingsShell } from "@/components/settings-shell";
import "react-color-palette/css";
import {
  FormatConfig,
  FormatConfig_ColorMode,
  FormatConfig_Themes,
  FormatConfig_Time,
  LocalhostConfig,
  ParseConfig,
  ParseConfig_Level,
  ParseConfig_Message,
  ParseConfig_Time,
  RuntimeConfig,
} from "api/js/types/v1/localhost_config_pb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn, TIME_FORMAT } from "@/lib/utils";
import FieldTagsInput from "@/components/ui/field-text-input";
import { toast } from "sonner";
import { ThemeEditor } from "@/components/settings/ThemeEditor";

const COLOR_MODE_OPTIONS = [
  { value: FormatConfig_ColorMode.COLORMODE_AUTO.toString(), label: "Auto" },
  {
    value: FormatConfig_ColorMode.COLORMODE_ENABLED.toString(),
    label: "Enabled",
  },
  {
    value: FormatConfig_ColorMode.COLORMODE_DISABLED.toString(),
    label: "Disabled",
  },
];

const formSchema = z.object({
  // formatter
  themes: z.custom<FormatConfig_Themes>(),
  format: z.string(),
  timezone: z.string().optional(),
  skipFields: z.array(z.string()).default([]),
  keepFields: z.array(z.string()).default([]),
  sortLongest: z.boolean().optional(),
  skipUnchanged: z.boolean().optional(),
  terminalColorMode: z.string(),
  //parser
  timestamp: z.array(z.string()).default([]),
  message: z.array(z.string()).default([]),
  level: z.array(z.string()).default([]),
  //runtime
  skipCheckForUpdates: z.boolean().optional(),
  interrupt: z.boolean().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

const LocalhostSettings = () => {
  const { apiClients } = useApiClients();

  const [initialConfig, setInitialConfig] = useState<LocalhostConfig>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const formValues = form.watch();

  const getConfig = async () => {
    try {
      const res = await apiClients?.localhost.getConfig({});
      if (res?.config) {
        const { config: _config } = res;

        form.reset({
          // runtime
          skipCheckForUpdates: !!_config.runtime?.skipCheckForUpdates,
          interrupt: !!_config.runtime?.interrupt,
          //parser
          timestamp: _config.parser?.timestamp?.fieldNames,
          message: _config.parser?.message?.fieldNames,
          level: _config.parser?.level?.fieldNames,
          // formatter
          skipFields: _config.formatter?.skipFields,
          keepFields: _config.formatter?.keepFields,
          sortLongest: !!_config.formatter?.sortLongest,
          skipUnchanged: !!_config.formatter?.skipUnchanged,
          format: _config.formatter?.time?.format,
          timezone: _config.formatter?.time?.timezone,
          themes: _config.formatter?.themes,
          terminalColorMode:
            _config.formatter?.terminalColorMode?.toString() ?? "0",
        });

        setInitialConfig(_config);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings. Please try again.");
    }
  };

  const submitConfig = async (config: LocalhostConfig) => {
    try {
      await apiClients?.localhost.setConfig({
        config,
      });
      toast.success("Configuration has been successfully updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update configuration. Please try again");
    }
  };

  /** huamnlog version update */
  const doUpdate = async () => {
    try {
      await apiClients?.localhost.doUpdate({});
      toast.success("Humanlog has been successfully updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update Humanlog. Please try again");
    }
  };

  /** humanlog service restart */
  const doRestart = async () => {
    try {
      await apiClients?.localhost.doRestart({});
      toast.success("Humanlog service has been successfully restarted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to restart Humanlog service. Please try again");
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const {
        // formatter
        themes,
        format,
        timezone,
        skipFields,
        keepFields,
        sortLongest,
        skipUnchanged,
        terminalColorMode,
        //parser
        timestamp,
        message,
        level,
        //runtime
        skipCheckForUpdates,
        interrupt,
      } = data;

      const _config = new LocalhostConfig({
        version: initialConfig?.version,
        formatter: new FormatConfig({
          themes,
          time: new FormatConfig_Time({
            timezone,
            format,
          }),
          sortLongest,
          skipUnchanged,
          skipFields,
          keepFields,
          ...(terminalColorMode && {
            terminalColorMode: parseInt(
              terminalColorMode,
            ) as FormatConfig_ColorMode,
          }),
        }),
        parser: new ParseConfig({
          timestamp: new ParseConfig_Time({ fieldNames: timestamp }),
          message: new ParseConfig_Message({ fieldNames: message }),
          level: new ParseConfig_Level({ fieldNames: level }),
        }),
        runtime: new RuntimeConfig({
          interrupt,
          skipCheckForUpdates,
          features: initialConfig?.runtime?.features,
          experimentalFeatures: initialConfig?.runtime?.experimentalFeatures,
        }),
      });

      submitConfig(_config);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <SettingsShell activeSection="localhost">
      {initialConfig && (
        <div className="mt-4 min-w-[300px]">
          <Form {...form}>
            <form
              className="flex flex-col gap-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Label className="border-t py-3 text-xl">Formatter</Label>

              <FormField
                control={form.control}
                name="themes"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <div className="mt-6">
                        {/* Light Theme */}
                        <div>
                          <h3 className="mb-4 text-lg font-medium">
                            Light Theme
                          </h3>
                          <ThemeEditor mode="light" formValues={formValues} />
                        </div>

                        {/* Dark Theme */}
                        <div className="mt-10">
                          <h3 className="mb-4 text-lg font-medium">
                            Dark Theme
                          </h3>
                          <ThemeEditor mode="dark" formValues={formValues} />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Format</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex flex-row items-center gap-2">
                            <SquareCode size={16} />
                            <SelectValue placeholder="Select a time format" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(TIME_FORMAT).map(
                            ([format, value]) => (
                              <SelectItem key={format} value={value}>
                                {value}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex flex-row items-center gap-2">
                            <SquareCode size={16} />
                            <SelectValue placeholder="Select timezone" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="local">Local Time</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortLongest"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Sort key-values by longest first"
                      isChecked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skipUnchanged"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Skip unchanged key-values"
                      isChecked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skipFields"
                render={({ field }) => (
                  <FormItem>
                    <FieldTagsInput
                      label="Skip Fields"
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="Add fields to skip from output..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keepFields"
                render={({ field }) => (
                  <FormItem>
                    <FieldTagsInput
                      label="Keep Fields"
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="Add fields to keep in output..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terminalColorMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terminal Color Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex flex-row items-center gap-2">
                            <SquareCode size={16} />
                            <SelectValue placeholder="Select Terminal Color Mode" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {COLOR_MODE_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Label className="mt-8 border-t py-3 text-xl">Parser</Label>

              <FormField
                control={form.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FieldTagsInput
                      label="Timestamp"
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="Add timestamp field name..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FieldTagsInput
                      label="Level"
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="Add log level field name..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FieldTagsInput
                      label="Message"
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="Add message field name..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Label className="mt-8 border-t py-3 text-xl">Runtime</Label>

              <FormField
                control={form.control}
                name="interrupt"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Ignore interrupts (when parsing from stdin)"
                      isChecked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skipCheckForUpdates"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Disable update checks"
                      isChecked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button onClick={doUpdate} type="button">
                  Do Update
                </Button>
                <Button onClick={doRestart} type="button">
                  Restart
                </Button>
              </div>

              <Button type="submit" className="mt-10">
                Save
              </Button>
            </form>
          </Form>
        </div>
      )}
    </SettingsShell>
  );
};

export default LocalhostSettings;

interface ToggleProps {
  name: string;
  isChecked: boolean;
  onChange?: (checked: boolean) => void;
}

const Toggle = ({ name, isChecked, onChange }: ToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Switch id={name} checked={isChecked} onCheckedChange={onChange} />
      <Label
        htmlFor={name}
        className={cn("transition-colors duration-200", {
          "text-slate-500": !isChecked,
        })}
      >
        {name}
      </Label>
    </div>
  );
};

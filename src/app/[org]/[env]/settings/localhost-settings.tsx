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
import { Clock, Database, Globe, Sparkles, SquareCode } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

import "react-color-palette/css";
import {
  FormatConfigSchema,
  FormatConfig_ColorMode,
  FormatConfig_Themes,
  FormatConfig_TimeSchema,
  LocalhostConfig,
  LocalhostConfigSchema,
  ParseConfigSchema,
  ParseConfig_LevelSchema,
  ParseConfig_MessageSchema,
  ParseConfig_TimeSchema,
  RuntimeConfigSchema,
} from "api/js/types/v1/localhost_config_pb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { TIME_FORMAT } from "@/lib/utils/formatTimeStamp";
import FieldTagsInput from "@/components/ui/field-text-input";
import { toast } from "sonner";
import { ThemeEditor } from "@/components/settings/ThemeEditor";
import { getConfig } from "@/services/localhostService";
import { create } from "@bufbuild/protobuf";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Palette, Terminal, RefreshCw } from "lucide-react";
import LoadingIndicator from "@/components/loading-indicator";
import { usePing } from "@/hooks/usePing";

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

export const LocalhostSettings = () => {
  const { apiClients } = useApiClients();
  const { localhostData, isLoadingLocalhost } = usePing();
  const [initialConfig, setInitialConfig] = useState<LocalhostConfig>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const formValues = form.watch();

  const handleConfig = async () => {
    if (!apiClients) return;

    await getConfig(apiClients.localhost, {
      onSuccess: (res) => {
        if (res.config) {
          const { config } = res;
          form.reset({
            // runtime
            skipCheckForUpdates: !!config.runtime?.skipCheckForUpdates,
            interrupt: !!config.runtime?.interrupt,
            //parser
            timestamp: config.parser?.timestamp?.fieldNames,
            message: config.parser?.message?.fieldNames,
            level: config.parser?.level?.fieldNames,
            // formatter
            skipFields: config.formatter?.skipFields,
            keepFields: config.formatter?.keepFields,
            sortLongest: !!config.formatter?.sortLongest,
            skipUnchanged: !!config.formatter?.skipUnchanged,
            format: config.formatter?.time?.format,
            timezone: config.formatter?.time?.timezone,
            themes: config.formatter?.themes,
            terminalColorMode:
              config.formatter?.terminalColorMode?.toString() ?? "0",
          });
          setInitialConfig(config);
        }
      },
    });
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

      const _config = create(LocalhostConfigSchema, {
        version: initialConfig?.version,
        formatter: create(FormatConfigSchema, {
          themes,
          time: create(FormatConfig_TimeSchema, {
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
        parser: create(ParseConfigSchema, {
          timestamp: create(ParseConfig_TimeSchema, { fieldNames: timestamp }),
          message: create(ParseConfig_MessageSchema, { fieldNames: message }),
          level: create(ParseConfig_LevelSchema, { fieldNames: level }),
        }),
        runtime: create(RuntimeConfigSchema, {
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
    handleConfig();
  }, []);

  if (isLoadingLocalhost) return <LoadingIndicator />;

  if (!localhostData) return;

  return (
    <div className="w-full space-y-6 px-10 py-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Localhost Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your local development environment
          </p>
        </div>

        {/* System Management */}
        <div className="flex gap-3">
          <Button onClick={doUpdate} type="button">
            <Sparkles className="h-4 w-4" />
            Update Humanlog
          </Button>
          <Button onClick={doRestart} type="button">
            <RefreshCw className="h-4 w-4" />
            Restart Service
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Formatter Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Formatter Settings
              </CardTitle>
              <CardDescription>
                Configure how your logs are displayed and formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="themes"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <div>
                        {/* Light Theme */}
                        <div>
                          <h3 className="mb-4 text-lg font-medium">
                            Light Theme
                          </h3>
                          <ThemeEditor
                            mode="light"
                            formValues={formValues}
                            setValue={form.setValue}
                          />
                        </div>

                        {/* Dark Theme */}
                        <div className="mt-10">
                          <h3 className="mb-4 text-lg font-medium">
                            Dark Theme
                          </h3>
                          <ThemeEditor
                            mode="dark"
                            formValues={formValues}
                            setValue={form.setValue}
                          />
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
                            <Clock size={16} />
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
                            <Globe size={16} />
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
            </CardContent>
          </Card>

          {/* Parser Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Parser Settings
              </CardTitle>
              <CardDescription>
                Configure how log fields are parsed and identified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Runtime Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Runtime Settings
              </CardTitle>
              <CardDescription>
                Configure runtime behavior and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Save Configuration
          </Button>
        </form>
      </Form>
    </div>
  );
};

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
          "text-muted-foreground": !isChecked,
        })}
      >
        {name}
      </Label>
    </div>
  );
};

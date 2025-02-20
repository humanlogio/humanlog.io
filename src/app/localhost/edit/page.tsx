"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ControllerRenderProps,
  useForm,
  useFormContext,
} from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useEffect, useRef, useState } from "react";
import { SettingsShell } from "@/components/settings-shell";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GetConfigResponse } from "api/js/svc/localhost/v1/service_pb";
import {
  FormatConfig_ColorMode,
  FormatConfig_Theme,
  FormatConfig_Themes,
  LocalhostConfig,
} from "api/js/types/v1/localhost_config_pb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import FieldTagsInput from "@/components/ui/field-text-input";
import NewSessionPanel from "@/components/sortable/new-session-panel";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { config } from "process";
import { Panel, PanelGroup } from "react-resizable-panels";
import { ResizableHandle } from "@/components/ui/resizable";
import { valueToJSX } from "@/lib/utils/valueFormatters";
import { useThemeColors } from "@/lib/utils/useThemeColors";
import { useInfiniteQuery } from "@connectrpc/connect-query";
import { useDebouncer } from "@/lib/utils/useDebouncer";
import { Preview } from "@/components/edit/Preview";

const TIME_FORMAT = {
  "MMM D HH:mm:ss": "Jan _2 15:04:05",
  "YYYY-MM-DDTHH:mm:ssZ": "2006-01-02T15:04:05Z07:00",
  "YYYY-MM-DD HH:mm:ss": "2006-01-02 15:04:05",
  "ddd MMM D HH:mm:ss YYYY": "Mon Jan _2 15:04:05 2006",
  "ddd MMM D HH:mm:ss z YYYY": "Mon Jan _2 15:04:05 MST 2006",
  "ddd MMM DD HH:mm:ss ZZ YYYY": "Mon Jan 02 15:04:05 -0700 2006",
  "h:mmA": "3:04PM",
  "YYYY/MM/DD HH:mm:ss": "2006/01/02 15:04:05",
  "DD/MM/YYYY HH:mm:ss": "02/01/2006 15:04:05",
  "MM/DD/YYYY HH:mm:ss": "01/02/2006 15:04:05",
  "MM-DD HH:mm:ss": "01-02 15:04:05",
  "HH:mm:ss": "15:04:05",
  "HH:mm:ss.SSS": "15:04:05.000",
};

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

const Edit = () => {
  const { apiClients } = useApiClients();

  const [initialConfig, setInitialConfig] = useState<LocalhostConfig>();

  // 폼 스키마 정의
  // const formSchema = z.custom<LocalhostConfig>
  const formSchema = z.object({
    //runtime
    skipCheckForUpdates: z.boolean().optional(),
    interrupt: z.boolean().optional(),
    //parser
    timestamp: z.array(z.string()).default([]),
    message: z.array(z.string()).default([]),
    level: z.array(z.string()).default([]),
    // formatter
    skipFields: z.array(z.string()).default([]), // 기본값으로 빈 배열 설정
    keepFields: z.array(z.string()).default([]),
    sortLongest: z.boolean().optional(),
    skipUnchanged: z.boolean().optional(),
    format: z.string(),
    timezone: z.string().optional(),
    themes: z.object({
      light: z.custom<FormatConfig_Theme>(),
      dark: z.custom<FormatConfig_Theme>(),
    }),
    terminalColorMode: z.string(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // 모든 필드 감시
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
    }
  };

  const submitConfig = async (config: LocalhostConfig) => {
    await apiClients?.localhost.setConfig({
      config,
    });
  };

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

  useEffect(() => {
    getConfig();
  }, []);
  console.log("initialConfig", initialConfig);

  const onSubmit = async (data: FormValues) => {
    try {
      // API 호출 등 필요한 로직
      console.log("⭐️Form submitted:", data);
      const {
        sortLongest,
        skipUnchanged,
        format,
        timezone,
        terminalColorMode,
        timestamp,
        message,
        level,
      } = data;
      // const _config: LocalhostConfig = {
      //   version: initialConfig?.version as bigint,
      //   parser: {
      //     timestamp: {
      //       fieldNames: timestamp,
      //     },
      //     message: {
      //       fieldNames: message,
      //     },
      //     level: {
      //       fieldNames: level,
      //     },
      //   },
      //   formatter: {
      //     sortLongest,
      //     skipUnchanged,
      //     time: {
      //       format,
      //       timezone,
      //     },
      //     ...(terminalColorMode && { terminalColorMode }),
      //   },
      // };
      // submitConfig(_config);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <SettingsShell activeSection="localhost">
      {initialConfig && (
        <div className="mt-4 min-w-[300px]">
          <Form {...form}>
            <form
              className="flex flex-col gap-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="skipCheckForUpdates"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Skip Check For Updates"
                      isChecked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interrupt"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Interrupt"
                      isChecked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="my-5 w-full border-b" />

              <FormField
                control={form.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FieldTagsInput
                      label="Timestamp"
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="Add field to skip..."
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
                      placeholder="Add field to skip..."
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
                      placeholder="Add field to skip..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="my-5 w-full border-b" />

              <FormField
                control={form.control}
                name="sortLongest"
                render={({ field }) => (
                  <FormItem>
                    <Toggle
                      name="Sort Longest"
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
                      name="Skip Unchanged"
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
                      placeholder="Add field to skip..."
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
                      placeholder="Add field to skip..."
                    />
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
                            <SelectValue placeholder="Select format" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(TIME_FORMAT).map((format) => (
                            <SelectItem key={format} value={format}>
                              {format}
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

              <div className="my-5 w-full border-b" />

              <Button type="submit">submit</Button>
            </form>
          </Form>
          {/* <div className="my-5 w-full border-b" />
          <div className="flex gap-4">
            <Button onClick={doUpdate}>Do Update</Button>
            <Button onClick={doRestart}>Restart</Button>
          </div> */}
        </div>
      )}
    </SettingsShell>
  );
};

export default Edit;

interface ThemeColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

const ThemeColorPicker = ({
  label,
  value,
  onChange,
  description,
}: ThemeColorPickerProps) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [color, setColor] = useColor(value ?? "");

  return (
    <>
      <div className="relative flex flex-col gap-2">
        <div className="flex w-60 items-center justify-between">
          <Label>{label}</Label>
          <div className="relative flex gap-2">
            {color.hex}
            <button
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: color.hex }}
            />
          </div>
        </div>

        {isColorPickerOpen && (
          <div>
            <ColorPicker
              color={color}
              onChange={(newColor) => {
                setColor(newColor);
                onChange(newColor.hex);
              }}
            />
          </div>
        )}

        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    </>
  );
};

interface ThemeEditorProps {
  mode: "light" | "dark";
  formValues: any;
}

const ThemeEditor = ({ mode, formValues }: ThemeEditorProps) => {
  const { control } = useFormContext();

  return (
    <div className="flex gap-12 space-y-4">
      <div className="grid gap-4">
        {/* Base colors */}
        <div className="mt-2 space-y-2">
          <h4 className="text-sm font-medium">{"<Base Colors>"}</h4>
          <FormField
            control={control}
            name={`themes.${mode}.key.foreground.htmlHexColor`}
            render={({ field }) => (
              <ThemeColorPicker
                label="Key"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            control={control}
            name={`themes.${mode}.value.foreground.htmlHexColor`}
            render={({ field }) => (
              <ThemeColorPicker
                label="Value"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            control={control}
            name={`themes.${mode}.time.foreground.htmlHexColor`}
            render={({ field }) => (
              <ThemeColorPicker
                label="Time"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            control={control}
            name={`themes.${mode}.msg.foreground.htmlHexColor`}
            render={({ field }) => (
              <ThemeColorPicker
                label="Message"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Log Levels */}
        <div className="mt-2 space-y-2">
          <h4 className="text-sm font-medium">{"<Log Levels>"}</h4>
          {["debug", "info", "warn", "error", "panic", "fatal", "unknown"].map(
            (level) => (
              <FormField
                key={level}
                control={control}
                name={`themes.${mode}.levels.${level}.foreground.htmlHexColor`}
                render={({ field }) => (
                  <ThemeColorPicker
                    label={level.charAt(0).toUpperCase() + level.slice(1)}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ),
          )}
        </div>
      </div>
      <Preview themes={formValues.themes} isDark={mode === "dark"} />
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
          "text-slate-500": !isChecked,
        })}
      >
        {name}
      </Label>
    </div>
  );
};

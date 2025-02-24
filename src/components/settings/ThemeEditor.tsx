import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { ThemeColorPicker } from "@/components/settings/ThemeColorPicker";
import { FormValues } from "@/app/settings/localhost/page";
import { Preview } from "@/components/settings/Preview";

interface ThemeEditorProps {
  mode: "light" | "dark";
  formValues: FormValues;
}

export const ThemeEditor = ({ mode, formValues }: ThemeEditorProps) => {
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
      <div>
        <Preview
          themes={formValues.themes}
          isDark={mode === "dark"}
          timeformat={formValues.format}
        />
      </div>
    </div>
  );
};

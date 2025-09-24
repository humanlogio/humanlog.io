import { useFormContext, UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { ThemeColorPicker } from "@/components/settings/ThemeColorPicker";
import { FormValues } from "@/app/[org]/[env]/settings/localhost-settings";
import { Preview } from "@/components/settings/Preview";

interface ThemeEditorProps {
  mode: "light" | "dark";
  setValue: UseFormReturn<FormValues>["setValue"];
  formValues: FormValues;
}

export const ThemeEditor = ({
  mode,
  setValue,
  formValues,
}: ThemeEditorProps) => {
  const { control } = useFormContext();

  return (
    <div className="flex gap-12 space-y-4">
      <div className="grid gap-4">
        {/* Base colors */}
        <div className="mt-2 space-y-2">
          <h4 className="text-sm font-medium">{"<Base Colors>"}</h4>
          <FormField
            control={control}
            name={`themes.${mode}.time.foreground.htmlHexColor`}
            render={({ field }) => (
              <ThemeColorPicker
                setValue={setValue}
                mode={mode}
                label="Time"
                name={field.name}
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
                setValue={setValue}
                mode={mode}
                label="Message"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            control={control}
            name={`themes.${mode}.key.foreground.htmlHexColor`}
            render={({ field }) => (
              <ThemeColorPicker
                setValue={setValue}
                mode={mode}
                label="Key"
                name={field.name}
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
                setValue={setValue}
                mode={mode}
                label="Value"
                name={field.name}
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
                    setValue={setValue}
                    mode={mode}
                    label={level.charAt(0).toUpperCase() + level.slice(1)}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ),
          )}
        </div>
      </div>
      <div className="w-full">
        <Preview
          themes={formValues.themes}
          mode={mode}
          timeformat={formValues.format}
        />
      </div>
    </div>
  );
};

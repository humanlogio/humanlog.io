import { Warning } from "@/components/ui/Alert";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";

interface ReadOnlyFieldProps {
  control: Control<any>;
  readOnly: boolean;
  disabled: boolean;
  fieldName: string;
}

export const ReadOnlyField = ({
  control,
  readOnly,
  disabled,
  fieldName,
}: ReadOnlyFieldProps) => {
  return (
    <>
      <FormField
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <FormLabel className="text-base">Read-only</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </div>
              <FormDescription>
                When enabled, dashboards and alerts can only be edited through
                the file system. When disabled, changes can be made in the UI
                but will overwrite local files.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {/* Warning when readonly is disabled */}
      {!readOnly && (
        <Warning title="File Overwrite Warning">
          <p>
            Disabling read-only mode allows UI edits but{" "}
            <strong>will overwrite your local files</strong> at the specified
            path. Any changes made directly to the files will be lost when you
            save changes through the UI.
          </p>
          <p className="mt-2">
            Consider using a Git to backup your files before proceeding.
          </p>
        </Warning>
      )}
    </>
  );
};

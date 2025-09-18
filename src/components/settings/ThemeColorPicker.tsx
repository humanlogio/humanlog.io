import { useEffect, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import { Label } from "@/components/ui/label";
import { useThemeColors } from "@/lib/hooks/useThemeColors";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/app/[org]/[env]/settings/localhost-settings";

interface ThemeColorPickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
  mode: "light" | "dark";
  setValue: UseFormReturn<FormValues>["setValue"];
}

export const ThemeColorPicker = ({
  label,
  name,
  value,
  onChange,
  description,
  mode,
  setValue,
}: ThemeColorPickerProps) => {
  const isDark = mode === "dark";
  const { hexToRgb, defaultColors } = useThemeColors(isDark);
  const initialColor = hexToRgb(value) ? value : defaultColors[mode];

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [color, setColor] = useColor(initialColor);

  useEffect(() => {
    setValue(name as keyof FormValues, initialColor);
  }, []);

  return (
    <>
      <div className="relative flex flex-col gap-2">
        <div className="flex w-60 items-center justify-between">
          <Label>{label}</Label>
          <div className="relative flex gap-2">
            {color.hex}
            <button
              type="button"
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: color.hex }}
            />
          </div>
        </div>

        {isColorPickerOpen && (
          <div className="flex gap-1">
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

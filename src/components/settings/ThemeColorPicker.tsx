import { useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import { Label } from "@/components/ui/label";

interface ThemeColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

export const ThemeColorPicker = ({
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

import React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "./form";

interface FieldTagsInputProps {
  /** 필드의 레이블 */
  label: string;
  /** 현재 태그 값들의 배열 */
  values: string[];
  /** 태그 값이 변경될 때 호출되는 함수 */
  onChange: (values: string[]) => void;
  /** 입력 필드의 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 필드가 비활성화되어야 하는지 여부 */
  disabled?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 필드 설명 텍스트 */
  description?: string;
}

const FieldTagsInput = ({
  label,
  values,
  onChange,
  placeholder = "Add new field...",
  disabled = false,
  error,
  description,
}: FieldTagsInputProps) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!values.includes(inputValue.trim())) {
        onChange([...values, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(values.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>

      {/* existing tags */}
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(tag)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* new tags */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={() => {
            if (inputValue.trim() && !values.includes(inputValue.trim())) {
              onChange([...values, inputValue.trim()]);
              setInputValue("");
            }
          }}
          disabled={!inputValue.trim() || values.includes(inputValue.trim())}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default FieldTagsInput;

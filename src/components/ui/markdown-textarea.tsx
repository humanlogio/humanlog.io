import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  id?: string;
  name?: string;
  label?: string;
  error?: string;
}

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = "Add notes or description (supports Markdown)",
  className = "",
  minRows = 6,
  id = "markdown-editor",
  name,
  label,
  error,
}: MarkdownEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = 24;
    const minHeight = minRows * lineHeight;

    textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}

      <div className="overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none">
        <div className="flex items-center justify-between bg-black px-3 py-2 text-white">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`rounded px-2 py-1 text-sm hover:bg-gray-400 ${!showPreview && "bg-white text-black"}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`rounded px-2 py-1 text-sm hover:bg-gray-400 ${showPreview && "bg-white text-black"}`}
            >
              Preview
            </button>
          </div>
        </div>

        {!showPreview ? (
          <textarea
            ref={textareaRef}
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full p-2 focus:outline-none ${className}`}
            autoComplete="off"
            data-form-type="other"
            style={{
              minHeight: `${minRows * 24}px`,
            }}
          />
        ) : (
          <div
            className="markdown-preview prose p-2"
            style={{
              minHeight: `${minRows * 24}px`,
            }}
          >
            {value ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <div className="text-gray-400 italic">{placeholder}</div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default MarkdownEditor;

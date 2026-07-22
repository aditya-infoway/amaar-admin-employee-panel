import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

interface PhotoUploadProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function PhotoUpload({ label, value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <span className="dark:text-dark-100 mb-1.5 block text-xs+ font-medium text-gray-800">
        {label}
      </span>
      <div
        onClick={() => inputRef.current?.click()}
        className="dark:border-dark-450 dark:hover:border-dark-300 relative flex h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 dark:bg-dark-700"
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-1 top-1 rounded-full bg-gray-900/70 p-1 text-white hover:bg-gray-900"
            >
              <XMarkIcon className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <PhotoIcon className="size-7" />
            <span className="text-xs">Upload photo</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
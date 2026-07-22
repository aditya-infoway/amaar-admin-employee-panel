import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

interface PhotoUploadProps {
  label: string;
  value?: string | File;
  onChange: (value: string | File) => void;
  error?: string;
}

export function PhotoUpload({ label, value, onChange, error }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // value File ho (naya select kiya photo) ya string ho (existing/edit mode ka path) — dono handle karo
  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // memory leak se bachne ke liye cleanup
    }
    if (typeof value === "string" && value) {
      setPreviewUrl(value);
      return;
    }
    setPreviewUrl("");
  }, [value]);

  const handleFile = (file?: File) => {
    if (!file) return;
    // YAHI FIX HAI: pehle base64 string bhejte the (reader.readAsDataURL),
    // ab seedha File object bhejo — taaki FormData me ye actual "file" ki tarah jaaye
    // aur backend ke multer isko req.files me pakde, req.body me nahi.
    onChange(file);
  };

  return (
    <div>
      <span className="dark:text-dark-100 mb-1.5 block text-xs+ font-medium text-gray-800">
        {label}
      </span>
      <div
        onClick={() => inputRef.current?.click()}
        className={`dark:hover:border-dark-300 relative flex h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-gray-50 transition-colors hover:border-gray-400 dark:bg-dark-700 ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-gray-300 dark:border-dark-450"
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
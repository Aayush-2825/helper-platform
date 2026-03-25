import { useState, useRef } from "react";
import { useController, FieldValues, FieldPath, Control } from "react-hook-form";
import { Upload, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  hint?: string;
  required?: boolean;
}

/**
 * File upload field with preview and validation
 * Provides visual feedback for uploads in progress and completion
 */
export function FileUploadField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  accept = "image/*,application/pdf",
  maxSize = 5,
  hint,
  required = false,
}: FileUploadFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({
    control,
    name,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Validate file size
    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Update field value
    field.onChange(file);
    setFileName(file.name);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    field.onChange(null);
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasFile = (field.value && typeof field.value === "object" && "size" in field.value) || !!fileName;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>

      {!hasFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-colors p-6 text-center cursor-pointer",
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            required={required}
          />

          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-900">
            Drop file here or click to upload
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept === "image/*" ? "PNG, JPG, GIF up to " : "PDF, images up to "}
            {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          {preview ? (
            <div className="relative w-full h-40 mb-3 rounded overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-32 mb-3 rounded bg-white border border-gray-200 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                {field.value && typeof field.value === 'object' && 'name' in field.value
                  ? `${(field.value.size / 1024).toFixed(1)}KB`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {hint && (
        <p className="text-xs text-gray-500">
          💡 {hint}
        </p>
      )}

      {fieldState.error && (
        <p className="text-xs text-red-500">
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}

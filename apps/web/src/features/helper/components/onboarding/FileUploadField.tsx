import { useEffect, useRef, useState } from "react";
import { useController, FieldValues, FieldPath, Control } from "react-hook-form";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { uploadFile } from "@/lib/storage/file-upload";
import { toast } from "sonner";

interface FileUploadFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  category?: "image" | "document" | "kyc";
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
  category = "kyc",
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `file-upload-${String(name).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  useEffect(() => {
    if (typeof field.value === "string" && field.value.trim().length > 0 && !fileName) {
      setFileName(field.value.split("/").pop() ?? field.value);
    }
  }, [field.value, fileName]);

  const handleFile = async (file: File) => {
    // Validate file size
    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB.`);
      return;
    }

    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    try {
      setIsUploading(true);
      const folder = `helper-platform/onboarding/${String(name).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
      const uploadResult = await uploadFile(file, category, folder);

      // Store object key only; server validates this key on submission.
      field.onChange(uploadResult.id);
      setFileName(file.name);
      toast.success("File uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      return;
    } finally {
      setIsUploading(false);
    }

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
      void handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void handleFile(files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
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

  const hasFile = (typeof field.value === "string" && field.value.trim().length > 0) || !!fileName;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      </div>

      {!hasFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-colors p-6 text-center cursor-pointer",
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            isUploading && "pointer-events-none opacity-60"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            required={required}
          />

          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          {isUploading ? (
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
          ) : null}
          <p className="text-sm font-medium text-gray-900">
            {isUploading ? "Uploading..." : "Drop file here or click to upload"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept === "image/*" ? "PNG, JPG up to " : "PDF, PNG, JPG up to "}
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
                Uploaded to secure storage
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
          {hint}
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

/**
 * File Upload Utilities
 * Handles file validation, upload preview, and cloud storage integration
 */

// ============= VALIDATION =============

export interface FileValidationOptions {
  maxSizeMb?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_VALIDATORS: Record<string, FileValidationOptions> = {
  image: {
    maxSizeMb: 3,
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
  },
  document: {
    maxSizeMb: 5,
    allowedTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
  },
  kyc: {
    maxSizeMb: 5,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
    allowedExtensions: ["jpg", "jpeg", "png", "pdf"],
  },
};

export function validateFile(
  file: File,
  category: keyof typeof DEFAULT_VALIDATORS
): { valid: boolean; error?: string } {
  const rules = DEFAULT_VALIDATORS[category];

  if (!rules) {
    return { valid: true }; // No validation rules defined
  }

  // Check file size
  const fileSizeMb = file.size / (1024 * 1024);
  if (fileSizeMb > (rules.maxSizeMb || 5)) {
    return {
      valid: false,
      error: `File size must be less than ${rules.maxSizeMb}MB`,
    };
  }

  // Check file type
  if (rules.allowedTypes && !rules.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted: ${rules.allowedExtensions?.join(", ")}`,
    };
  }

  // Check file extension
  if (rules.allowedExtensions) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !rules.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension not allowed. Accepted: ${rules.allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
}

// ============= PREVIEW GENERATION =============

export async function generateFilePreview(file: File): Promise<{
  type: "image" | "document" | "unknown";
  data: string | null;
}> {
  if (file.type.startsWith("image/")) {
    return {
      type: "image",
      data: await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }),
    };
  }

  if (file.type === "application/pdf") {
    return {
      type: "document",
      data: null, // PDF preview requires additional setup
    };
  }

  return {
    type: "unknown",
    data: null,
  };
}

// ============= CLOUD STORAGE INTEGRATION =============

export interface CloudStorageConfig {
  provider: "cloudinary" | "aws-s3" | "google-cloud" | "custom";
  credentials: Record<string, string>;
}

/**
 * Upload file to Cloudinary
 * Requires: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  options?: {
    publicId?: string;
    tags?: string[];
    eager?: string[];
  }
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "");
  formData.append("folder", `zapier/${folder}`);

  if (options?.publicId) {
    formData.append("public_id", options.publicId);
  }

  if (options?.tags) {
    formData.append("tags", options.tags.join(","));
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Upload file to AWS S3
 * Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
 */
export async function uploadToS3(
  file: File,
  folder: string
): Promise<{ url: string; key: string }> {
  try {
    // Get presigned URL from your backend
    const presignedResponse = await fetch("/api/uploads/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        folder,
      }),
    });

    const { uploadUrl, key } = await presignedResponse.json();

    // Upload to S3 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("S3 upload failed");
    }

    return {
      url: `${process.env.NEXT_PUBLIC_AWS_S3_URL}/${key}`,
      key,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Generic upload function that routes to appropriate service
 */
export async function uploadFile(
  file: File,
  category: keyof typeof DEFAULT_VALIDATORS,
  folder: string,
  provider: CloudStorageConfig["provider"] = "cloudinary"
): Promise<{ url: string; id: string }> {
  // Validate file
  const validation = validateFile(file, category);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Upload based on provider
  switch (provider) {
    case "cloudinary": {
      const result = await uploadToCloudinary(file, folder, { tags: [category] });
      return { url: result.url, id: result.publicId };
    }

    case "aws-s3": {
      const result = await uploadToS3(file, folder);
      return { url: result.url, id: result.key };
    }

    default:
      throw new Error(`Unsupported upload provider: ${provider}`);
  }
}

// ============= FILE MANIFEST =============

/**
 * Track uploaded files for cleanup if form is abandoned
 */
export class FileManifest {
  private files: Map<string, { url: string; id: string; timestamp: number }> =
    new Map();

  private storageKey = "onboarding_file_manifest";

  add(field: string, url: string, id: string) {
    this.files.set(field, {
      url,
      id,
      timestamp: Date.now(),
    });
    this.persist();
  }

  get(field: string) {
    return this.files.get(field);
  }

  getAll() {
    return Array.from(this.files.values());
  }

  remove(field: string) {
    this.files.delete(field);
    this.persist();
  }

  clear() {
    this.files.clear();
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn("Failed to clear manifest:", error);
    }
  }

  private persist() {
    try {
      const data = Array.from(this.files.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to persist manifest:", error);
    }
  }

  static load(): FileManifest {
    const manifest = new FileManifest();
    try {
      const data = localStorage.getItem(manifest.storageKey);
      if (data) {
        const entries = JSON.parse(data);
        entries.forEach(([key, value]: [string, unknown]) => {
          manifest.files.set(
            key,
            value as { url: string; id: string; timestamp: number },
          );
        });
      }
    } catch (error) {
      console.warn("Failed to load manifest:", error);
    }
    return manifest;
  }
}

// ============= COMPRESSION =============

/**
 * Compress image before upload to reduce bandwidth/storage
 */
export async function compressImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<File> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      let { width, height } = img;
      const maxWidth = options?.maxWidth || 1920;
      const maxHeight = options?.maxHeight || 1080;

      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressed = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: file.lastModified,
            });
            resolve(compressed);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/jpeg",
        options?.quality || 0.8
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

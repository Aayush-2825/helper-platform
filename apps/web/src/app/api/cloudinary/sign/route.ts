import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw ApiError.unauthorized();
    }

    const { folder, public_id, tags } = await request.json();

    const timestamp = Math.round(Date.now() / 1000);

    const requestedFolder = typeof folder === "string" ? folder.replace(/[^a-zA-Z0-9_\-\/]/g, "").replace(/\.\./g, "") : "helper-platform";
    // Sanitize folder to ensure user cannot write arbitrary roots or overwrite system assets
    const sanitizedFolder = requestedFolder.startsWith("kyc")
      ? `kyc/${session.user.id}`
      : `uploads/${session.user.id}/${requestedFolder.replace(/^\/+/, "")}`;

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: sanitizedFolder,
    };

    if (public_id) {
      paramsToSign.public_id = public_id;
    }

    if (tags) {
      paramsToSign.tags = tags;
    }

    // For KYC documents, enforce authenticated access mode
    if (sanitizedFolder.startsWith("kyc")) {
      paramsToSign.type = "authenticated";
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder: sanitizedFolder,
      type: paramsToSign.type,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
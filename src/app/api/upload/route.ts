import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// Supports either CLOUDINARY_URL or the individual CLOUDINARY_* vars.
if (process.env.CLOUDINARY_URL) {
   cloudinary.config({
      secure: true,
      cloudinary_url: process.env.CLOUDINARY_URL,
   });
} else {
   cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
   });
}

type CloudinaryUploadResult = {
   secure_url?: string;
};

function uploadBufferToCloudinary(buffer: Buffer, opts: { folder?: string; publicId?: string }) {
   return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
         {
            resource_type: "image",
            folder: opts.folder,
            public_id: opts.publicId,
            overwrite: true,
         },
         (error, result) => {
            if (error) reject(error);
            else resolve((result ?? {}) as CloudinaryUploadResult);
         }
      );

      upload.end(buffer);
   });
}

export async function POST(request: NextRequest) {
   try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
         return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const hasCloudinary =
         Boolean(process.env.CLOUDINARY_URL) ||
         (Boolean(process.env.CLOUDINARY_CLOUD_NAME) && Boolean(process.env.CLOUDINARY_API_KEY) && Boolean(process.env.CLOUDINARY_API_SECRET));

      if (!hasCloudinary) {
         return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
      }

      const maxBytes = 10 * 1024 * 1024;
      if (typeof file.size === "number" && file.size > maxBytes) {
         return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
      }

      const folder = (formData.get("folder") as string | null) ?? process.env.CLOUDINARY_FOLDER ?? "e-commerce";
      const publicId = (formData.get("publicId") as string | null) ?? undefined;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadBufferToCloudinary(buffer, { folder, publicId });
      const url = result.secure_url;
      if (!url?.startsWith("http")) throw new Error("Invalid URL returned from Cloudinary");

      return NextResponse.json({ url });
   } catch (error) {
      console.error("Image upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
   }
}

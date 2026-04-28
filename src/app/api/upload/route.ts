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

function toDirectDriveUrl(input: string): string {
   // Accepts various Google Drive share formats and converts to a direct download URL
   // Examples:
   // - https://drive.google.com/file/d/<ID>/view?usp=sharing
   // - https://drive.google.com/open?id=<ID>
   // - https://drive.google.com/uc?id=<ID>&export=download
   // - https://docs.google.com/uc?id=<ID>&export=download
   const url = input.trim();
   const idFromFilePath = url.match(/\/file\/d\/([^/]+)/)?.[1];
   const idFromQuery = url.match(/[?&]id=([^&]+)/)?.[1];
   const id = idFromFilePath ?? idFromQuery;
   if (!id) return url;
   return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

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
      const hasCloudinary =
         Boolean(process.env.CLOUDINARY_URL) ||
         (Boolean(process.env.CLOUDINARY_CLOUD_NAME) && Boolean(process.env.CLOUDINARY_API_KEY) && Boolean(process.env.CLOUDINARY_API_SECRET));

      if (!hasCloudinary) {
         return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
      }

      const contentType = request.headers.get("content-type") ?? "";

      // 1) multipart/form-data: { file, folder?, publicId? }
      if (contentType.includes("multipart/form-data")) {
         const formData = await request.formData();
         const file = formData.get("file") as File | null;
         if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
      }

      // 2) application/json: { imageUrl, folder?, publicId? }  (supports Google Drive)
      const json = await request.json().catch(() => null) as null | {
         imageUrl?: string;
         folder?: string;
         publicId?: string;
      };

      const imageUrlRaw = json?.imageUrl?.trim();
      if (!imageUrlRaw) {
         return NextResponse.json({ error: "Provide either file (multipart) or imageUrl (json)" }, { status: 400 });
      }

      const imageUrl = toDirectDriveUrl(imageUrlRaw);
      const folder = json?.folder ?? process.env.CLOUDINARY_FOLDER ?? "e-commerce";
      const publicId = json?.publicId;

      const uploaded = await cloudinary.uploader.upload(imageUrl, {
         resource_type: "image",
         folder,
         public_id: publicId,
         overwrite: true,
      }) as CloudinaryUploadResult;

      const url = uploaded.secure_url;
      if (!url?.startsWith("http")) throw new Error("Invalid URL returned from Cloudinary");
      return NextResponse.json({ url });
   } catch (error) {
      console.error("Image upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
   }
}

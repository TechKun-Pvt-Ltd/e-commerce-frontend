import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
         return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Forward to catbox.moe server-side — no CORS restrictions here
      const uploadFormData = new FormData();
      uploadFormData.append("reqtype", "fileupload");
      uploadFormData.append("fileToUpload", file);

      const res = await fetch("https://catbox.moe/user/api.php", {
         method: "POST",
         body: uploadFormData,
      });

      if (!res.ok) throw new Error(`Catbox responded with ${res.status}`);

      const url = (await res.text()).trim();
      if (!url.startsWith("http")) throw new Error("Invalid URL returned from catbox");

      return NextResponse.json({ url });
   } catch (error) {
      console.error("Image upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
   }
}

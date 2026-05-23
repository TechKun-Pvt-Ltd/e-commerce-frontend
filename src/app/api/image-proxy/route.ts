import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Google deprecated drive.google.com/uc?id= direct serving in 2024.
// Use drive.usercontent.google.com/download — Google's current public-file endpoint.
function transformUrl(url: string): string {
  if (url.includes("drive.google.com")) {
    const match = url.match(/[?&]id=([^&]+)/);
    if (match) return `https://drive.usercontent.google.com/download?id=${match[1]}&export=view&authuser=0`;
  }
  return url;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Missing url param", { status: 400 });

  const target = transformUrl(decodeURIComponent(raw));

  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    // Reject non-image responses (e.g. Google sign-in HTML page)
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Upstream did not return an image", { status: 502 });
    }

    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache aggressively — product images rarely change
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[image-proxy] error fetching", target, err);
    return new NextResponse("Proxy error", { status: 500 });
  }
}

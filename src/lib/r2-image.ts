/**
 * Wraps an R2 storage URL through Next.js image optimization proxy.
 * Other URLs pass through unchanged.
 */
export function r2src(url: string): string {
  if (!url || !url.includes("r2.dev")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=3840&q=85`;
}

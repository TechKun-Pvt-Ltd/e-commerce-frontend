"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import * as bannerImagesService from "@/services/bannerImages";
import { r2src } from "@/lib/r2-image";

// Panoramic canvas wall art — room scene background (product cvs-pan-008)
const HERO_LEFT =
  "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/kanvas-panoramik/cvs-pan-008/cercevesizfon01.webp";

// Area rug — room scene view (product hym03)
const HERO_RIGHT =
  "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/hali/hym03/hal2.webp";

const Banner = () => {
  const [defaultUrl, setDefaultUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await bannerImagesService.getDefaultBannerImage();
      if (!mounted) return;
      if (res.success && res.data && typeof res.data.imageUrl === "string" && res.data.imageUrl.trim()) {
        setDefaultUrl(res.data.imageUrl);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const leftUrl = r2src(HERO_LEFT);
  const rightUrl = useMemo(() => r2src(defaultUrl ?? HERO_RIGHT), [defaultUrl]);

  return (
    <section className="relative flex items-start sm:items-center overflow-hidden bg-stone-100 min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-9rem)]">

      {/* Background — stacked on mobile, split on sm+ */}
      <div className="absolute inset-0 flex flex-col sm:flex-row">
        <div className="relative flex-1 sm:h-full sm:w-1/2 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Golden sparkling fluid abstract panoramic canvas wall art in a modern living room"
            src={leftUrl}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative flex-1 sm:w-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Gilded mineral abstract gold and charcoal washable area rug in a modern room"
            src={rightUrl}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" aria-hidden />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1536px] mx-auto px-5 sm:px-8 md:px-12 pt-7 pb-10 sm:py-10 md:py-14">
        <div className="bg-white/45 backdrop-blur-md p-6 sm:p-8 md:p-10 lg:p-12 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-[0_12px_40px_rgba(78,70,57,0.10)]">

          <span className="block mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[oklch(0.16_0.02_55)]">
            Canvas Prints · Glass Wall Art · Wallpaper · Area Rugs
          </span>

          <h1 className="font-display text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-stone-900 leading-[1.08] mb-4 sm:mb-5">
            Transform Your<br />Walls & Floors
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6 sm:mb-7">
            Premium canvas prints, tempered glass wall art, removable wallpaper, and washable area rugs — curated for modern living.
          </p>

          <Button
            asChild
            className="rounded-none bg-[oklch(0.16_0.02_55)] text-white hover:bg-[oklch(0.24_0.02_55)] px-7 sm:px-9 py-4 h-auto text-[11px] tracking-[0.2em] uppercase font-semibold"
          >
            <Link href="/products">Explore Now</Link>
          </Button>

        </div>
      </div>
    </section>
  );
};

export default Banner;

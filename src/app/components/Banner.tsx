"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const HERO_LEFT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC84UWnQ9TTXJj0iVO0xX63Kip-_UqcfyVRnailflVn50Zd-y8rNYm99ytqKWFLoNqmQsWl70fP-12Tb58JLkxmEguQS4JHHBQ6I-1R_5UQCRh7FOFNb2z7TwRl2XFMrVtQjZFZULWEgp4ZSnlPjk0Er64RJPFw5gFLUn8E34F9qxJpKAWXAIM-0gp1jXwaCgc_hATupWxBC6qnX-Pcf35zkeT2--Gk6a6UUR9VSO3RNefu093I1Wr8lXtPNahh0iNtAPf0DGNUglU";

const HERO_RIGHT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDT2mxfqyKBne6ZkgeS8tnatrp73Uglh2_P3Q22SiAMd1pHaQ34bdpJIMVGp0snHbz3SZnhYWUG_kuWAhhnI_uroL_dUe4DQcp65pb9O2g24zTeFebZXZM_sEPL6eNxBXn0_b0gzl71W3VmQJZi2vfA9ei4HmIFaNUiZT3J6xc6_DhC4iA90560m4dj1j3sN1CcPQ9myT3GduRqMJ_BQUiur0kXiFMgGJ0vbLKNtO185spwfJRvpVl2eFgB5ONtAylvr_k90zfIkrU";

const Banner = () => {
  return (
    <section className="relative min-h-[520px] md:min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden bg-stone-100">
      <div className="absolute inset-0 flex flex-col md:flex-row">
        <div className="relative h-56 sm:h-64 md:h-full md:w-1/2 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Minimalist decor and sculpture in soft light"
            src={HERO_LEFT}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative flex-1 md:w-1/2 min-h-[240px] md:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Luxury living space with neutral tones"
            src={HERO_RIGHT}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" aria-hidden />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1536px] mx-auto px-5 sm:px-8 md:px-12 py-10 md:py-16">
        <div className="bg-white/85 backdrop-blur-md p-8 md:p-12 lg:p-16 max-w-2xl shadow-[0_20px_40px_rgba(78,70,57,0.06)]">
          <span className="font-medium text-[11px] sm:text-xs tracking-[0.25em] uppercase text-amber-900 mb-4 sm:mb-6 block">
            New Arrivals / Autumn 24
          </span>
          <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-stone-900 leading-[1.1] mb-6 md:mb-8">
            The KAVENGO
            <br />
            Signature
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-8 md:mb-10 max-w-lg">
            Elevating contemporary living through a meticulously curated collection of
            artisanal artifacts and luxury home decor.
          </p>
          <Button
            asChild
            className="rounded-full bg-amber-900 text-white hover:bg-amber-800 px-8 sm:px-10 py-5 h-auto text-xs tracking-[0.2em] uppercase font-semibold"
          >
            <Link href="/products">Explore Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Banner;

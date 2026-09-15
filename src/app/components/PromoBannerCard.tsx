/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { r2src } from '@/lib/r2-image';

const PROMO_IMAGES = [
    // Canvas panoramic — nature breeze on fon (wall art in room)
    "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon01.webp",
    // Canvas panoramic — pink & turquoise fluid abstract
    "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon01.webp",
    // Area rug — impressionist wildflower meadow
    "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/hali/hym105/hal1.webp",
    // Area rug — warm ochre sunburst expressionist
    "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/hali/hym04/hal1.webp",
] as const;

export default function PromoBannerCard() {
    return (
        <div className="responsive-container w-full py-10 sm:py-14 md:py-16">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16">

                {/* Text side */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-2/5 shrink-0">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c]">
                        Limited Time Offer
                    </p>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
                        Up to 50% OFF <br className="hidden md:block" />on Wall Art & Rugs
                    </h2>
                    <p className="mt-4 mb-8 text-sm text-muted-foreground max-w-xs">
                        Premium canvas prints, glass art, and washable rugs at unmissable prices — while stocks last.
                    </p>
                    <Link
                        href="/products"
                        className="inline-block border border-foreground/25 px-10 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                    >
                        Shop Now
                    </Link>
                </div>

                {/* Images side */}
                <div className="w-full md:flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                    <img
                        src={r2src(PROMO_IMAGES[0])}
                        alt="Abstract nature breeze panoramic canvas wall art"
                        className="w-full aspect-[3/4] object-cover"
                    />
                    <img
                        src={r2src(PROMO_IMAGES[1])}
                        alt="Pink and turquoise fluid abstract canvas wall art"
                        className="w-full aspect-[3/4] object-cover mt-6 sm:mt-10"
                    />
                    <img
                        src={r2src(PROMO_IMAGES[2])}
                        alt="Impressionist wildflower meadow washable area rug"
                        className="w-full aspect-[3/4] object-cover -mt-6 sm:-mt-10"
                    />
                    <img
                        src={r2src(PROMO_IMAGES[3])}
                        alt="Warm ochre sunburst expressionist washable area rug"
                        className="w-full aspect-[3/4] object-cover"
                    />
                </div>
            </div>
        </div>
    );
}

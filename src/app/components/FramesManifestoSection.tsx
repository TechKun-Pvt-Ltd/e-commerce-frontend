/* eslint-disable @next/next/no-img-element */
import { r2src } from "@/lib/r2-image";

// Canvas panoramic — elegant pastel & earth tones (product cvs-pan-003)
const MANIFESTO_IMAGE =
    "https://pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev/img/products/kanvas-panoramik/cvs-pan-003/cercevesizfon01.webp";

export default function FramesManifestoSection() {
    return (
        <section className="w-full py-24 md:py-40">
            <div className="responsive-container">
                <div className="flex flex-col items-center gap-16 md:flex-row md:items-center md:gap-24">
                    <div className="w-full md:w-1/2">
                        <img
                            src={r2src(MANIFESTO_IMAGE)}
                            alt="Pastel and earth tones abstract panoramic canvas wall art — crafted for modern interiors"
                            className="aspect-[3/4] w-full object-cover grayscale"
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <span className="mb-6 block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c9a84c]">
                            Our Philosophy
                        </span>
                        <h2 className="font-display mb-10 text-4xl font-bold leading-tight tracking-tighter text-foreground md:text-5xl">
                            Walls tell stories.<br />
                            We help you write them.
                        </h2>
                        <p className="mb-12 text-lg leading-relaxed text-foreground/80 md:text-xl">
                            From canvas prints to tempered glass art, from removable wallpaper to washable rugs — every
                            piece is crafted to transform your space with lasting quality and style.
                        </p>
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12">
                            <div>
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">
                                    Canvas & Glass
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    HD canvas prints and tempered glass wall art in custom sizes.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">
                                    Wallpaper & Rugs
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Removable wallpaper and machine-washable area rugs for easy refresh.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

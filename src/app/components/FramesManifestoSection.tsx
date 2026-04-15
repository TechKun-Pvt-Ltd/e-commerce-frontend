/* eslint-disable @next/next/no-img-element */

const MANIFESTO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDXCACdgH-k2u20bUm2JrpfuYIjOVG9SiJe2wGp6w6BVwHRool_2nQweYt45U3Q3JXTqCtD2eLpjp3h7AtLsqLrdgcGAQhjnfHJMhgJz3gvBe_RxFj755eKFW1QgagC7u3jRoi9SCQq5HSAzat8XxErTy6vivdDZic90pZuhuwtyALZp6gwC0ExablPVlHIRcGXJhJBQB3kJH0A30Xpf_0g1mAd-6Culgn6I3jcAC621qrGtyUfJW4U9wPelCauNsuMPNOXNZrw1O0";

export default function FramesManifestoSection() {
    return (
        <section className="w-full bg-neutral-50 py-24 md:py-40">
            <div className="responsive-container">
                <div className="flex flex-col items-center gap-16 md:flex-row md:items-center md:gap-24">
                    <div className="w-full md:w-1/2">
                        <img
                            src={MANIFESTO_IMAGE}
                            alt="Interior designer placing framed artwork on a gallery wall"
                            className="aspect-[3/4] w-full object-cover grayscale"
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <span className="mb-6 block text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                            Our Philosophy
                        </span>
                        <h2 className="mb-10 text-4xl font-bold leading-tight tracking-tighter text-neutral-950 md:text-5xl [font-family:var(--font-headline),ui-sans-serif,system-ui,sans-serif]">
                            Frames are the <br />
                            bones of a room.
                        </h2>
                        <p className="mb-12 text-lg leading-relaxed text-neutral-800 md:text-xl">
                            We believe that the boundary between art and architecture should be invisible. Our
                            frames don&apos;t just hold art; they structure the atmosphere of the space.
                        </p>
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12">
                            <div>
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-950">
                                    Bespoke Sizing
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Custom dimensions carved to your exact specifications.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-950">
                                    Lifetime Clarity
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    Anti-reflective acrylic that disappears from view.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

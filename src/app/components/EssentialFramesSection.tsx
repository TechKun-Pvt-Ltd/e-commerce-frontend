"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { getPromotionForProduct } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import type { ProductPreview } from "@/types/domains/product";

const EASE = "[transition-timing-function:cubic-bezier(0.23,1,0.32,1)]";

type EssentialFramesSectionProps = {
    products: ProductPreview[];
    isLoading?: boolean;
};

export default function EssentialFramesSection({ products, isLoading = false }: EssentialFramesSectionProps) {
    const promotions = useAppSelector((state) => state.promotions.items);
    const displayProducts = products.slice(0, 4);

    return (
        <section className="w-full bg-neutral-200 py-24 md:py-32">
            <div className="responsive-container">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center md:mb-20">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            Customer favourites
                        </p>
                        <h2 className="text-4xl font-bold tracking-tighter text-neutral-950 md:text-5xl [font-family:var(--font-headline),ui-sans-serif,system-ui,sans-serif]">
                            Best Seller Frame
                        </h2>
                        <p className="mt-4 text-neutral-600">
                            Top-rated and starred picks shoppers add to their walls first.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {isLoading &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-neutral-200 transition-transform duration-300 ${EASE}`}
                                >
                                    <ProductCardSkeleton />
                                </div>
                            ))}

                        {!isLoading &&
                            displayProducts.length > 0 &&
                            displayProducts.map((product) => {
                                const promo = getPromotionForProduct(product, promotions);
                                return (
                                    <div
                                        key={product.productId}
                                        className={`overflow-hidden rounded-md bg-white shadow-md ring-1 ring-neutral-200 transition-all duration-300 hover:shadow-lg hover:ring-neutral-300 ${EASE} hover:-translate-y-0.5`}
                                    >
                                        <ProductCard product={product} promo={promo} />
                                    </div>
                                );
                            })}

                        {!isLoading && displayProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-neutral-400/60 bg-neutral-50 px-6 py-14 text-center">
                                <p className="text-sm font-medium text-neutral-800">No best sellers to show yet</p>
                                <Button asChild variant="outline" className="rounded-full border-black/20">
                                    <Link href="/products">Browse all products</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

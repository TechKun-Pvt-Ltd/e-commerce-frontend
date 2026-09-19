"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Product, ProductVariant } from "@/types/domains/product";
import { PromotionDetails } from "@/types/domains/promotion";

interface PriceBlockProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  priceRange: [number, number];
  productPromo: PromotionDetails | null;
  stockStatus: { label: string; color: string };
  isOutOfStock: boolean;
  calculateDiscountedPrice: (price: number, promo: PromotionDetails | null) => number;
}

export function PriceBlock({
  selectedVariant,
  priceRange,
  productPromo,
  stockStatus,
  calculateDiscountedPrice,
}: PriceBlockProps) {
  const totalPrice = useMemo(() => {
    return selectedVariant?.price ?? (priceRange[0] === priceRange[1] ? priceRange[0] : null);
  }, [selectedVariant, priceRange]);

  const discountedPrice = useMemo(() => {
    if (totalPrice === null) return null;
    return calculateDiscountedPrice(totalPrice, productPromo);
  }, [totalPrice, productPromo, calculateDiscountedPrice]);

  const discountedPriceRange = useMemo(() => {
    if (!productPromo) return priceRange;
    return [
      calculateDiscountedPrice(priceRange[0], productPromo),
      calculateDiscountedPrice(priceRange[1], productPromo),
    ] as [number, number];
  }, [priceRange, productPromo, calculateDiscountedPrice]);

  return (
    <div className="space-y-1">
      {productPromo && (
        <span className="inline-block bg-amber-600 hover:bg-amber-600 text-white border-0 rounded-sm text-xs font-semibold tracking-wide px-2 py-0.5">
          {productPromo.promotionType === "PERCENTAGE"
            ? `${productPromo.discountValue}% OFF`
            : `$${productPromo.discountValue} OFF`}
        </span>
      )}
      <div className="flex items-baseline gap-3">
        {selectedVariant && totalPrice !== null ? (
          <>
            <span className="text-2xl font-semibold text-primary">
              ${(discountedPrice ?? totalPrice).toFixed(2)}
            </span>
            {productPromo && discountedPrice !== null && discountedPrice !== totalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${totalPrice.toFixed(2)}
              </span>
            )}
            {productPromo && discountedPrice !== null && discountedPrice !== totalPrice && (
              <span className="text-xs text-amber-700 font-medium">
                Save ${(totalPrice - discountedPrice).toFixed(2)}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-2xl font-semibold text-primary">
              {discountedPriceRange[0] === discountedPriceRange[1]
                ? `$${discountedPriceRange[0].toFixed(2)}`
                : `$${discountedPriceRange[0].toFixed(2)} – $${discountedPriceRange[1].toFixed(2)}`}
            </span>
            {productPromo && priceRange[0] !== discountedPriceRange[0] && (
              <span className="text-sm text-muted-foreground line-through">
                {priceRange[0] === priceRange[1]
                  ? `$${priceRange[0].toFixed(2)}`
                  : `$${priceRange[0].toFixed(2)} – $${priceRange[1].toFixed(2)}`}
              </span>
            )}
          </>
        )}
      </div>
      {/* Stock status */}
      <p className={`${cn("text-sm font-medium", stockStatus.color)}`}>{stockStatus.label}</p>
    </div>
  );
}
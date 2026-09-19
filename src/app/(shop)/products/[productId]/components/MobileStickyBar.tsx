"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product, ProductImage, ProductVariant } from "@/types/domains/product";
import { PromotionDetails } from "@/types/domains/promotion";

interface MobileStickyBarProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  enabledVariants: ProductVariant[];
  activeImage: ProductImage | null;
  totalPrice: number | null;
  discountedPrice: number | null;
  isOutOfStock: boolean;
  priceRange: [number, number];
  discountedPriceRange: [number, number];
  productPromo: PromotionDetails | null;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function MobileStickyBar({
  selectedVariant,
  totalPrice,
  discountedPrice,
  isOutOfStock,
  priceRange,
  discountedPriceRange,
  productPromo,
  isAddingToCart,
  isBuyingNow,
  onAddToCart,
  onBuyNow,
}: MobileStickyBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-3 shadow-lg">
      <div className="flex flex-col shrink-0 min-w-0">
        {productPromo && (
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide leading-tight">
            {productPromo.promotionType === "PERCENTAGE" ? `${productPromo.discountValue}% OFF` : `$${productPromo.discountValue} OFF`}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">Price</span>
        <span className="text-base font-semibold text-primary leading-tight">
          {selectedVariant && totalPrice !== null
            ? `$${(discountedPrice ?? totalPrice).toFixed(2)}`
            : discountedPriceRange[0] === discountedPriceRange[1]
              ? `$${discountedPriceRange[0].toFixed(2)}`
              : `$${discountedPriceRange[0].toFixed(2)}+`}
        </span>
        {productPromo && (
          <span className="text-[11px] text-muted-foreground line-through leading-tight">
            {selectedVariant && totalPrice !== null
              ? `$${totalPrice.toFixed(2)}`
              : priceRange[0] === priceRange[1]
                ? `$${priceRange[0].toFixed(2)}`
                : `$${priceRange[0].toFixed(2)}+`}
          </span>
        )}
      </div>
      <Button
        className="flex-1 h-10 rounded-none tracking-widest text-xs font-medium"
        onClick={onAddToCart}
        disabled={isOutOfStock || isAddingToCart || isBuyingNow}
      >
        {isAddingToCart ? (
          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Adding...</>
        ) : isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
      </Button>
      <Button
        variant="outline"
        className="flex-1 h-10 rounded-none tracking-widest text-xs font-medium"
        onClick={onBuyNow}
        disabled={isOutOfStock || isBuyingNow || isAddingToCart}
      >
        {isBuyingNow ? (
          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Processing...</>
        ) : "BUY NOW"}
      </Button>
    </div>
  );
}
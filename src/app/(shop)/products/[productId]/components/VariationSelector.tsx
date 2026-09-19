"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PromotionDetails } from "@/types/domains/promotion";

type VariationMap = {
  [variationId: number]: {
    variationName: string;
    selectedOptionId?: number;
    options: {
      [variationOptionId: number]: {
        name: string;
        priceRange: [number, number];
      };
    };
  };
};

interface VariationSelectorProps {
  variationMap: VariationMap;
  productPromo: PromotionDetails | null;
  onSelectVariation: (variationId: number, optionId: number) => void;
  attemptedSubmit: boolean;
  calculateDiscountedPrice: (price: number, promo: PromotionDetails | null) => number;
  normalizeVariationName: (name: string) => string;
}

export function VariationSelector({
  variationMap,
  productPromo,
  onSelectVariation,
  attemptedSubmit,
  calculateDiscountedPrice,
  normalizeVariationName,
}: VariationSelectorProps) {
  return (
    <div className="space-y-3">
      {Object.entries(variationMap).map(([key, value]) => {
        const hasError = attemptedSubmit && value.selectedOptionId == null;
        return (
          <div key={key}>
            <label className={cn("text-sm font-medium block mb-1.5", hasError && "text-destructive")}>
              {normalizeVariationName(value.variationName)}
              {hasError && <span className="ml-1.5 font-normal">— required</span>}
            </label>
            <select
              value={value.selectedOptionId?.toString() ?? ""}
              onChange={(e) => onSelectVariation(Number(key), Number(e.target.value))}
              className={cn(
                "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm",
                hasError && "border-destructive ring-1 ring-destructive"
              )}
            >
              <option value="">Select {normalizeVariationName(value.variationName)}</option>
              {Object.entries(value.options)
                .sort(([, a], [, b]) => a.priceRange[0] - b.priceRange[0])
                .map(([optKey, optValue]) => {
                  const [lo, hi] = optValue.priceRange;
                  const discLo = calculateDiscountedPrice(lo, productPromo);
                  const discHi = calculateDiscountedPrice(hi, productPromo);
                  const priceLabel =
                    lo === hi
                      ? `$${discLo.toFixed(2)}`
                      : `$${discLo.toFixed(2)} – $${discHi.toFixed(2)}`;
                  return (
                    <option key={optKey} value={optKey}>
                      {optValue.name} — {priceLabel}
                    </option>
                  );
                })}
            </select>
          </div>
        );
      })}
    </div>
  );
}

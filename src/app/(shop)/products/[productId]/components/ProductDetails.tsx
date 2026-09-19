"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Product } from "@/types/domains/product";

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

interface ProductDetailsProps {
  product: Product;
  variationMap: VariationMap;
  categoryPath: { id: number; name: string }[];
  attrsExpanded: boolean;
  setAttrsExpanded: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function ProductDetails({
  product,
  variationMap,
  categoryPath,
  attrsExpanded,
  setAttrsExpanded,
}: ProductDetailsProps) {
  const productSpecRows = useMemo(() => {
    const allVariations = Object.values(variationMap);
    const sizeVariation = allVariations.find((v) =>
      v.variationName.toLowerCase().includes('size')
    ) ?? allVariations[0];
    const sizeVal = sizeVariation?.selectedOptionId != null
      ? (sizeVariation.options[sizeVariation.selectedOptionId]?.name ?? null)
      : null;

    let orientationVal = '—';
    if (sizeVal) {
      const nums = sizeVal.match(/\d+(\.\d+)?/g)?.map(Number);
      if (nums && nums.length >= 2) {
        const [w, h] = nums;
        orientationVal = w === h ? 'Square' : w > h ? 'Landscape' : 'Portrait';
      }
    }

    const material = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].name : '—';

    return [
      { label: 'Size', value: sizeVal ?? '—' },
      { label: 'Material', value: material },
      { label: 'Product Dimensions', value: sizeVal ?? '—' },
      { label: 'Number of Items', value: '1' },
      { label: 'Orientation', value: orientationVal },
      { label: 'Shape', value: 'Rectangle' },
      { label: 'Theme', value: '—' },
      { label: 'Frame Type', value: 'Framed / Unframed' },
      { label: 'Wall Art Form', value: 'Art Print' },
    ];
  }, [variationMap, categoryPath]);

  return (
    <div>
      <p className="text-base font-semibold text-foreground mb-3">Product Details</p>
      <dl className="divide-y divide-border border rounded-sm overflow-hidden text-sm">
        {(attrsExpanded ? productSpecRows : productSpecRows.slice(0, 7)).map((row) => (
          <div key={row.label} className="flex px-3 py-2">
            <dt className="w-2/5 font-medium text-foreground shrink-0">{row.label}</dt>
            <dd className="text-muted-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      {productSpecRows.length > 7 && (
        <button
          type="button"
          onClick={() => setAttrsExpanded((d) => !d)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
        >
          {attrsExpanded ? "See less" : `See all ${productSpecRows.length} details`}
          <ChevronDown className={`${cn("h-3.5 w-3.5 transition-transform duration-200", attrsExpanded && "rotate-180")}`} />
        </button>
      )}
    </div>
  );
}
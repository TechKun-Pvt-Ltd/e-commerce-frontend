"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  isOutOfStock: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ActionButtons({
  isOutOfStock,
  isAddingToCart,
  isBuyingNow,
  onAddToCart,
  onBuyNow,
}: ActionButtonsProps) {
  return (
    <div className="hidden md:block space-y-2.5">
      <Button
        className="w-full h-11 rounded-none tracking-widest text-sm font-medium"
        onClick={onAddToCart}
        disabled={isOutOfStock || isAddingToCart || isBuyingNow}
      >
        {isAddingToCart ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding to Cart...</>
        ) : isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
      </Button>
      <Button
        variant="outline"
        className="w-full h-11 rounded-none tracking-widest text-sm font-medium"
        onClick={onBuyNow}
        disabled={isOutOfStock || isBuyingNow || isAddingToCart}
      >
        {isBuyingNow ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
        ) : "BUY NOW"}
      </Button>
    </div>
  );
}

"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductImage, Product } from "@/types/domains/product";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ProductGalleryProps {
  product: Product;
  activeImage: ProductImage | null;
  onImageChange: (image: ProductImage) => void;
  priority?: boolean;
}

export function ProductGallery({
  product,
  activeImage,
  onImageChange,
  priority = false,
}: ProductGalleryProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const swipeTouchStartX = useRef<number | null>(null);
  const swipeTouchStartY = useRef<number | null>(null);

  const currentImageIndex = product?.productImages?.findIndex(
    (img) => img.productImageId === activeImage?.productImageId
  ) ?? -1;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeTouchStartX.current = e.touches[0].clientX;
    swipeTouchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (
      swipeTouchStartX.current === null ||
      swipeTouchStartY.current === null ||
      product.productImages.length <= 1
    ) {
      swipeTouchStartX.current = null;
      swipeTouchStartY.current = null;
      return;
    }
    const dx = swipeTouchStartX.current - e.changedTouches[0].clientX;
    const dy = swipeTouchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && currentImageIndex < product.productImages.length - 1) {
        onImageChange(product.productImages[currentImageIndex + 1]);
      } else if (dx < 0 && currentImageIndex > 0) {
        onImageChange(product.productImages[currentImageIndex - 1]);
      }
    }
    swipeTouchStartX.current = null;
    swipeTouchStartY.current = null;
  }, [product.productImages, currentImageIndex, onImageChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (product.productImages.length <= 1) return;
      if (e.key === "ArrowLeft" && currentImageIndex > 0) {
        onImageChange(product.productImages[currentImageIndex - 1]);
      } else if (e.key === "ArrowRight" && currentImageIndex < product.productImages.length - 1) {
        onImageChange(product.productImages[currentImageIndex + 1]);
      }
    },
    [product.productImages, currentImageIndex, onImageChange]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
        <div className="flex items-start" style={{ gap: 0 }}>
          {/* Vertical thumbnail strip — desktop */}
          {product.productImages?.length > 1 && (
            <div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[520px] lg:max-h-[580px] xl:max-h-[680px] 2xl:max-h-[780px] thin-scrollbar shrink-0" style={{ width: '60px' }}>
              {product.productImages.map((img, index) => (
                <button
                  key={img.productImageId}
                  type="button"
                  onMouseEnter={() => onImageChange(img)}
                  onClick={() => onImageChange(img)}
                  className={`relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    activeImage?.productImageId === img.productImageId
                      ? "border-primary opacity-100 shadow-sm"
                      : "border-transparent opacity-55 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={`${product.title} — image ${index + 1}`}
                    fill
                    sizes="60px"
                    quality={80}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div
            className="relative flex-1 overflow-hidden h-[400px] md:h-[520px] lg:h-[580px] xl:h-[680px] 2xl:h-[780px] group cursor-zoom-in"
            onClick={() => product.productImages.length > 0 && setIsZoomOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-y-0 left-[16px] right-[16px]">
              {product.productImages && product.productImages.length > 0 ? (
                product.productImages.map((img, index) => (
                  <Image
                    key={img.productImageId}
                    src={img.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={85}
                    priority={index === 0 && priority}
                    loading={index === 0 ? undefined : "eager"}
                    className={cn(
                      "object-contain object-center transition-all duration-300",
                      activeImage?.productImageId === img.productImageId
                        ? "opacity-100 group-hover:scale-[1.02]"
                        : "opacity-0 pointer-events-none"
                    )}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              )}
            </div>
            {/* Zoom hint */}
            {product.productImages.length > 0 && (
              <div className="absolute top-2 right-[24px] bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4" />
              </div>
            )}
            {/* Image counter — desktop only */}
            {product.productImages.length > 1 && (
              <div className="hidden md:block absolute bottom-2 right-[24px] bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {product.productImages.length}
              </div>
            )}
            {/* Mobile dot indicators */}
            {product.productImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden pointer-events-none z-10">
                {product.productImages.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
            )}
            {/* Featured badge */}
            {product.starred && (
              <div className="absolute top-2 left-[24px]">
                <span className="bg-primary text-primary-foreground rounded-none text-xs tracking-wide px-2 py-0.5">Featured</span>
              </div>
            )}
            {/* Prev / Next arrows */}
            {product.productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex > 0) onImageChange(product.productImages[currentImageIndex - 1]);
                  }}
                  className={`absolute left-[24px] top-1/2 -translate-y-1/2 z-10 bg-white/85 rounded-full p-1.5 shadow-md transition-all ${currentImageIndex <= 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"}`}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex < product.productImages.length - 1) onImageChange(product.productImages[currentImageIndex + 1]);
                  }}
                  className={`absolute right-[24px] top-1/2 -translate-y-1/2 z-10 bg-white/85 rounded-full p-1.5 shadow-md transition-all ${currentImageIndex >= product.productImages.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"}`}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile thumbnail strip — horizontal, hidden on md+ */}
        <div className="md:hidden mt-3 flex flex-wrap gap-2">
          {product.productImages?.map((img, index) => (
            <button
              key={img.productImageId}
              type="button"
              onClick={() => onImageChange(img)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                activeImage?.productImageId === img.productImageId
                  ? "border-primary opacity-100 shadow-sm"
                  : "border-transparent opacity-55 hover:opacity-90"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={`${product.title} — image ${index + 1}`}
                fill
                sizes="56px"
                quality={80}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Zoom lightbox */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-full p-3 bg-background/98 backdrop-blur">
          <DialogTitle className="sr-only">{product.title} — image viewer</DialogTitle>
          <div className="flex items-center justify-center w-full h-[78vh] bg-muted/20 rounded">
            {activeImage && (
              <img
                src={activeImage.imageUrl}
                alt={product.title}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          {product.productImages.length > 1 && (
            <div className="flex justify-center gap-2 pt-2 overflow-x-auto">
              {product.productImages.map((img, index) => (
                <button
                  key={img.productImageId}
                  type="button"
                  onClick={() => { onImageChange(img); setIsZoomOpen(true); }}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-all ${
                    activeImage?.productImageId === img.productImageId
                      ? "border-primary"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={`${product.title} — image ${index + 1}`}
                    fill
                    sizes="56px"
                    className="object-contain p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
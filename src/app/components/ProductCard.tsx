/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, ShoppingCart, Star, X } from "lucide-react";
import Image from "next/image";
import { ProductPreview } from "@/types/domains/product";
import { PromotionDetails } from "@/types/domains/promotion";
import { toast } from "sonner";
import { CartItemPreview } from "@/types/domains/cart";
import CartToast from "./CartToast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import placeholderImage from "@/../public/placeholder-image.jpeg";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { addToCart } from "@/store/slices/cartSlice";
import { addToWishlistAsync, removeFromWishlistAsync } from "@/store/slices/wishlistSlice";

function getDiscountedPrice(price: number, promotion: PromotionDetails | null): number {
   if (!promotion) return price;

   if (promotion.promotionType === "PERCENTAGE") {
      return price * (1 - promotion.discountValue / 100);
   }

   // FLAT discount
   return Math.max(price - promotion.discountValue, 0);
}

export default function ProductCard({ product, promo }: { product: ProductPreview; promo: PromotionDetails | null }) {
   const dispatch = useAppDispatch();
   const wishlistItems = useAppSelector((state) => state.wishlist.items);
   const { authenticated } = useAppSelector((state) => state.auth);
   const wishlistItem = wishlistItems.find(item => item.productVariant.productVariantId === product.productVariantId);
   const isInWishlist = wishlistItem !== undefined;
   const discounted = getDiscountedPrice(product.price, promo);
   const isDiscounted = promo && discounted < product.price;
   const isInactive = product.status === false;

   const handleWishlistToggle = async () => {
      if (!authenticated) {
         toast.error("Please login to add items to wishlist");
         return;
      }

      try {
         if (isInWishlist && wishlistItem?.wishlistItemId) {
            // Remove from wishlist via API
            await dispatch(removeFromWishlistAsync(wishlistItem.wishlistItemId));
            toast.success("Removed from wishlist");
         } else {
            // Add to wishlist via API
            await dispatch(addToWishlistAsync(product.productVariantId));
            toast.success("Added to wishlist");
         }
      } catch (error) {
         toast.error("Failed to update wishlist");
      }
   };

   return (
      <Link href={`/products/${product.productId}`} className="block w-full">
         <div
            key={product.productId}
            className={[
               "group w-full border overflow-hidden rounded-md bg-white p-0 cursor-pointer",
               isInactive ? "opacity-80" : "",
            ].join(" ")}
         >
            <div className={["relative aspect-square overflow-hidden", isInactive ? "grayscale" : ""].join(" ")}>
               {/* Add to Cart  */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        size="icon"
                        variant="secondary"
                        disabled={isInactive}
                        className={[
                           "absolute size-7 sm:size-8 bg-white right-2 top-2 sm:top-3 rounded-full z-10",
                           isInactive ? "cursor-not-allowed opacity-60" : "",
                        ].join(" ")}
                        onClick={async (e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           if (isInactive) return;
                           await dispatch(
                              addToCart({
                                 productVariantId: product.productVariantId,
                                 quantity: 1,
                              })
                           );
                           if (toast.getToasts().find((toast) => toast.id === "cart-toast")) return;

                           toast(CartToast, {
                              id: "cart-toast",
                              position: "bottom-left",
                              closeButton: false,
                              style: {
                                 display: "block",
                                 padding: "0px",
                                 width: "min(500px, calc(100vw - 24px))",
                                 maxWidth: "500px",
                                 height: "auto",
                              },
                              dismissible: false,
                              duration: Infinity,
                           });
                        }}
                     >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                     <span>Add to Cart</span>
                  </TooltipContent>
               </Tooltip>
               {/* Wishlist icon */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        size="icon"
                        variant="secondary"
                        disabled={isInactive}
                        className={[
                           "absolute size-7 sm:size-8 shadow-md right-2 top-11 sm:top-14 rounded-full z-10 bg-white hover:bg-gray-100",
                           isInactive ? "cursor-not-allowed opacity-60 hover:bg-white" : "",
                        ].join(" ")}
                        onClick={e => {
                           e.preventDefault();
                           e.stopPropagation();
                           if (isInactive) return;
                           handleWishlistToggle();
                        }}
                     >
                        <Heart
                           className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                        />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                     <span>{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                  </TooltipContent>
               </Tooltip>
               {/* <img
               src={product.imageUrl}
               alt={product.title}
               className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            /> */}
               <Image
                  src={product.imageUrl || placeholderImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={[
                     "object-cover transition-transform duration-300",
                     isInactive ? "" : "group-hover:scale-[1.03]",
                  ].join(" ")}
               />

               {isInactive && (
                  <>
                     <div className="absolute inset-0 bg-black/30 z-[5]" />
                     <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 rounded-full bg-black text-white z-10 border border-white/20"
                     >
                        Deactivated
                     </Badge>
                  </>
               )}

               {isDiscounted && promo && !isInactive && (
                  <Badge variant="default" className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground z-10">
                     {promo.promotionType === "PERCENTAGE"
                        ? `${promo.discountValue}% OFF`
                        : `$${promo.discountValue} OFF`}
                  </Badge>
               )}
               {product.quantityInStock < 10 && (
                  <Badge
                     variant="destructive"
                     className={[
                        "absolute left-2 sm:left-3 rounded-full z-10",
                        // Prevent overlapping the right-side action icons on small screens.
                        "max-w-[calc(100%-3.25rem)] sm:max-w-none truncate",
                        // Slightly tighter on mobile.
                        "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5",
                        isDiscounted && promo ? "top-11 sm:top-12" : "top-2 sm:top-3",
                     ].join(" ")}
                  >
                     Only {product.quantityInStock} left
                  </Badge>
               )}
            </div>
            <CardContent className="p-3 sm:p-4">
               <div>
                  <div className="flex items-center space-y-2 space-x-1">
                     <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                           <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                                 }`}
                           />
                        ))}
                     </div>
                     <span className="text-xs text-muted-foreground">({product.rating})</span>
                  </div>
                  <h3 className="font-semibold line-clamp-2 text-sm mb-1">{product.title}</h3>
               </div>

               <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                     <span className="text-base font-bold text-foreground">${discounted.toFixed(2)}</span>
                     {isDiscounted && (
                        <span className="text-sm font-normal text-muted-foreground line-through">
                           ${product.price.toFixed(2)}
                        </span>
                     )}
                  </div>
                  {/* <Button variant="default" size="sm"
                        onClick={() => {
                            dispatch(addToCart({
                                productVariantId: product.productVariantId,
                                quantity: 1
                            }));
                            if (toast.getToasts().find(toast => toast.id === 'cart-toast'))
                                return;

                            toast(CartToast, {
                                id: 'cart-toast',
                                position: 'bottom-left',
                                closeButton: false,
                                style: {
                                    display: 'block', padding: '0px',
                                    width: '500px', height: 'auto'
                                },
                                dismissible: false,
                                duration: Infinity
                            });
                        }}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                    </Button> */}
               </div>
            </CardContent>
         </div>
      </Link>
   );
}

"use client";
import React from "react";
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
      return price - price * (promotion.discountValue / 100);
   } else if (promotion.promotionType === "FLAT") {
      return Math.max(price - promotion.discountValue, 0);
   }
   return price;
}

export default function ProductCard({ product, promo }: { product: ProductPreview; promo: PromotionDetails | null }) {
   const dispatch = useAppDispatch();
   const wishlistItems = useAppSelector((state) => state.wishlist.items);
   const { authenticated } = useAppSelector((state) => state.auth);
   // Check wishlist using Redux state only - product.starred is not used
   const isInWishlist = wishlistItems.some(item => item.productVariantId === product.productVariantId);
   const wishlistItem = wishlistItems.find(item => item.productVariantId === product.productVariantId);
   const discounted = getDiscountedPrice(product.price, promo);
   const isDiscounted = promo && discounted < product.price;

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
            await dispatch(addToWishlistAsync({ product, productVariantId: product.productVariantId }));
            toast.success("Added to wishlist");
         }
      } catch (error) {
         toast.error("Failed to update wishlist");
      }
   };

   return (
      <div key={product.productId} className=" w-full border  overflow-hidden  p-0">
         <div className="relative  aspect-square overflow-hidden">
            {/* Add to Cart  */}
            <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                     size="icon"
                     variant="secondary"
                     className="absolute size-8 bg-white right-2 rounded-full top-3 z-10"
                     onClick={async () => {
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
                              width: "500px",
                              height: "auto",
                           },
                           dismissible: false,
                           duration: Infinity,
                        });
                     }}
                  >
                     <ShoppingCart className="h-4 w-4 text-muted-foreground" />
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
                     className="size-8 absolute shadow-md right-2 rounded-full top-14 z-10 bg-white hover:bg-gray-100"
                     onClick={handleWishlistToggle}
                  >
                     <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
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
               width={210}
               height={200}
               className="w-full h-auto aspect-square object-cover"
            />

            {product.quantityInStock < 10 && (
               <Badge variant="destructive" className="absolute top-3 left-3 rounded-full">
                  Only {product.quantityInStock} left
               </Badge>
            )}
         </div>
         <CardContent className="p-4 ">
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

            <div className="flex items-center justify-between pt-2">
               <div>
                  <span className="text-base font-bold text-foreground">${discounted.toFixed(2)}</span>
                  {isDiscounted && <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>}
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
   );
}

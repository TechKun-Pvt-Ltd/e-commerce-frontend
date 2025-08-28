"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import Image from 'next/image';
import { ProductPreview } from '@/types/domains/product';
import { PromotionDetails } from '@/types/domains/promotion';
import { toast } from 'sonner';
import { CartItemPreview } from '@/types/domains/cart';
import CartToast from './CartToast';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


function getDiscountedPrice(
    price: number,
    promotion: PromotionDetails | null
): number {
    if (!promotion) return price
    if (promotion.promotionType === "PERCENTAGE") {
        return price - price * (promotion.discountValue / 100)
    } else if (promotion.promotionType === "FLAT") {
        return Math.max(price - promotion.discountValue, 0)
    }
    return price
};

export default function ProductCard({ product, promo }: { product: ProductPreview, promo: PromotionDetails | null }) {
    const discounted = getDiscountedPrice(product.price, promo);
    const isDiscounted = promo && discounted < product.price;

    return (
        <div
            key={product.productId}
            className=" w-[280px] border  overflow-hidden  p-0"
        >
            <div className="relative  aspect-square overflow-hidden">
                {/* Add to Cart  */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute size-8 bg-white right-2 rounded-full top-3 z-10"
                        >
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='left'>
                        <span>Add to Cart</span>
                    </TooltipContent>
                </Tooltip>
                {/* Wishlist icon */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="size-8 absolute shadow-md right-2 rounded-full top-14 z-10"

                        >
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='left'>
                        <span> Add to Wishlist </span>
                    </TooltipContent>
                </Tooltip>
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"

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
                                    className={`h-3 w-3 ${i < Math.floor(product.rating)
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground"
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
                        <span className="text-base font-bold text-foreground">
                            ${discounted.toFixed(2)}
                        </span>
                        {isDiscounted && (
                            <span className="text-lg font-bold text-primary">
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
    )
}
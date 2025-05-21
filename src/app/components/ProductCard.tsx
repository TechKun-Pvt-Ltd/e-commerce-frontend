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
    const dispatch = useAppDispatch();
    const discounted = getDiscountedPrice(product.price, promo);
    const isDiscounted = promo && discounted < product.price;

    return (
        <div
            key={product.productId}
            className="rounded-md border overflow-hidden shadow-sm hover:shadow-md transition relative"
        >
            {/* Wishlist icon */}
            <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 z-10"
            >
                <Heart className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Image */}
            <Image
                src={product.imageUrl}
                alt={product.title}
                width={200}
                height={200}
                className="w-full h-auto aspect-square object-cover"
            />

            <div className="p-2">
                {/* Title */}
                <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                    {product.title}
                </h3>

                {/* Rating & Stock */}
                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground">• {product.quantityInStock} in stock</span>
                </div>


                {/* Pricing */}
                <div className="mb-2">
                    <span className="text-base font-bold text-foreground">
                        ${discounted.toFixed(2)}
                    </span>
                    {isDiscounted && (
                        <span className="ml-2 text-sm line-through text-muted-foreground">
                            ${product.price.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Add to Cart */}
                <Button variant="default" size="sm" className="w-full"
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
                </Button>
            </div>
        </div>
    )
}
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromWishlistAsync } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import placeholderImage from "@/../public/placeholder-image.jpeg";
import { toast } from "sonner";
import CartToast from "./CartToast";
import { useRouter } from "next/navigation";
import useDataFetch from "@/hooks/use-data-fetch";
import * as wishlistServices from "@/services/wishlist";
import { WishlistItemDTO } from "@/types/domains/wishlist_item";

interface WishlistDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { authenticated, loading: authLoading } = useAppSelector((state) => state.auth);

    // Use useDataFetch hook to fetch wishlist items
    const getAllWishlist = useDataFetch(wishlistServices.getWishlistItems);
    const [wishlistItems, setWishlistItems] = useState<WishlistItemDTO[]>([]);

    // Load wishlist items from API when drawer opens and user is authenticated
    useEffect(() => {
        if (open && authenticated && !authLoading) {
          
            getAllWishlist.request()
                .onSuccess((data: WishlistItemDTO[]) => {
                    setWishlistItems(data);
                })
                .onError((error) => {
                    console.error('Failed to fetch wishlist:', error);
                });
        }
    }, [open, authenticated, authLoading, getAllWishlist.request]);

    const handleRemoveFromWishlist = (wishlistItemId: number) => {
        dispatch(removeFromWishlistAsync(wishlistItemId))
            .then(() => {
                getAllWishlist.request()
                    .onSuccess((data: WishlistItemDTO[]) => {
                        setWishlistItems(data);
                    });
            });
    };

    const handleAddToCart = async (productVariantId: number) => {
        await dispatch(
            addToCart({
                productVariantId,
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
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">My Wishlist</SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                    {getAllWishlist.isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Loading wishlist...</p>
                        </div>
                    ) : !authenticated ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-semibold text-muted-foreground">Please login to view wishlist</p>
                            <Button
                                className="mt-4"
                                onClick={() => {
                                    onOpenChange(false);
                                    router.push("/auth/login");
                                }}
                            >
                                Login
                            </Button>
                        </div>
                    ) : wishlistItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-semibold text-muted-foreground">Your wishlist is empty</p>
                            <p className="text-sm text-muted-foreground mt-2">Start adding items you love!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.wishlistItemId}
                                    className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                                        <Image
                                            src={item.productImageUrl || placeholderImage}
                                            alt={item.productVariant.sku}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.productVariant.sku}</h3>
                                        <p className="text-xs text-muted-foreground mb-2">SKU: {item.productVariant.sku}</p>
                                        <p className="text-base font-bold text-foreground">${item.productVariant.price.toFixed(2)}</p>

                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    // API se limited data aata hai, productVariantId directly available nahi
                                                    // Backend se productVariantId fetch karna padega ya product detail page se
                                                    toast.error("Product details not available. Please visit product page to add to cart.");
                                                }}
                                                disabled={true}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                Add to Cart
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="px-3"
                                                onClick={() => {
                                                    if (item.wishlistItemId) {
                                                        handleRemoveFromWishlist(item.wishlistItemId);
                                                    }
                                                }}
                                                disabled={!item.wishlistItemId || !authenticated}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}


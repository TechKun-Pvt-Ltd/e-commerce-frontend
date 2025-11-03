"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromWishlistAsync, fetchWishlistItems } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import placeholderImage from "@/../public/placeholder-image.jpeg";
import { toast } from "sonner";
import CartToast from "./CartToast";
import { useRouter } from "next/navigation";

interface WishlistDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const { authenticated, loading: authLoading } = useAppSelector((state) => state.auth);
    const { loading: wishlistLoading } = useAppSelector((state) => state.wishlist);

    // Load wishlist items when drawer opens and user is authenticated
    // Only fetch if we don't have items with full data, or if drawer first opens
    useEffect(() => {
        if (open && authenticated && !authLoading) {
            // Only fetch if we have no items or all items have productVariantId = 0 (limited data)
            const hasItemsWithFullData = wishlistItems.some(item => item.productVariantId > 0);
            if (!hasItemsWithFullData || wishlistItems.length === 0) {
                dispatch(fetchWishlistItems());
            }
        } else if (open && !authenticated && !authLoading) {
            toast.error("Please login to view wishlist");
            router.push("/auth/login");
            onOpenChange(false);
        }
    }, [open, authenticated, authLoading, dispatch, router, onOpenChange, wishlistItems.length]);

    const handleRemoveFromWishlist = (wishlistItemId: number) => {
        if (!authenticated) {
            toast.error("Please login to manage wishlist");
            router.push("/auth/login");
            return;
        }
        dispatch(removeFromWishlistAsync(wishlistItemId));
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
                    {wishlistLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Loading wishlist...</p>
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
                                    key={item.wishlistItemId || item.productVariantId}
                                    className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                                        <Image
                                            src={item.imageUrl || placeholderImage}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.title || item.code}</h3>
                                        <p className="text-xs text-muted-foreground mb-2">{item.code}</p>
                                        <p className="text-base font-bold text-foreground">${item.price.toFixed(2)}</p>

                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    if (item.productVariantId > 0) {
                                                        handleAddToCart(item.productVariantId);
                                                    } else if (item.starred) {
                                                        // If starred but no productVariantId, show message
                                                        toast.error("Please refresh page to load product details");
                                                    } else {
                                                        toast.error("Product information not available");
                                                    }
                                                }}
                                                disabled={item.productVariantId === 0}
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
                                                disabled={!item.wishlistItemId}
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


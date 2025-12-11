"use client";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, Heart, UserRound } from "lucide-react"
import UserMenuContent from "./UserMenuContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import WishlistDrawer from "./WishlistDrawer";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

export default function Header() {
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const wishlistItems = useAppSelector((state) => state.wishlist.items);

    return (<>
        <nav className="sticky top-0 z-50 w-full border-b bg-background px-4 md:px-8 flex items-center justify-between gap-4" style={{ height: NAVBAR_HEIGHT }}>
            {/* Logo */}
            <Link href="/" className="text-xl font-bold">
                KIOSKO
            </Link>

            {/* Search Input */}
            <div className="flex-1 max-w-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-10"
                    />
                </div>
            </div>

            {/* User + Cart */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="User menu">
                            <UserRound className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <UserMenuContent />
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Wishlist"
                    onClick={() => setWishlistOpen(true)}
                    className="relative"
                >
                    <Heart className={`h-5 w-5 ${wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {wishlistItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {wishlistItems.length}
                        </span>
                    )}
                    <span className="sr-only">Wishlist</span>
                </Button>
                {/* Cart Icon */}
                <Link href="/cart">
                    <Button variant="ghost" size="icon" aria-label="Cart">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                    </Button>
                </Link>
            </div>
        </nav>
        <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </>)
}

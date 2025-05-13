"use client";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, Heart } from "lucide-react"
import UserMenu from "./UserMenu";

export default function Header() {

    return (<>
        <nav className="sticky top-0 z-50 w-full border-b bg-background px-8 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
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
                    {/* User Dropdown */}
                    <UserMenu />

                    <Button variant="ghost" size="icon" aria-label="Wishlist">
                        <Heart className="h-5 w-5" />
                        <span className="sr-only">Wishlist</span>
                    </Button>
                    {/* Cart Icon */}
                    <Button variant="ghost" size="icon" aria-label="Cart">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                    </Button>
                </div>
            </div>
        </nav>
    </>)
}

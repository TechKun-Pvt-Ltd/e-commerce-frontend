"use client";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, Heart, UserRound, Settings, Menu } from "lucide-react"
import UserMenuContent from "./UserMenuContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import WishlistDrawer from "./WishlistDrawer";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
    { label: "Home", href: "/" },
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "My Orders", href: "/orders" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
];

export default function Header() {
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.roleName === UserRole.ADMIN;
    const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
    const canShowAdminSettings = isAdmin || isPlatformAdmin;

    return (<>
        <nav className="sticky top-0 z-50 w-full border-b bg-background px-4 md:px-8 flex items-center justify-between gap-3 sm:gap-4" style={{ height: NAVBAR_HEIGHT }}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile menu */}
                <div className="sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[90vw] max-w-[360px]">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="text-left">
                                    <Link href="/" className="text-lg font-bold">
                                        KAVENGO
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-4 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input type="search" placeholder="Search products..." className="w-full pl-10" />
                                </div>

                                <div className="flex flex-col">
                                    {menuItems.map((item) => (
                                        <SheetClose asChild key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="px-2 py-2 rounded-md hover:bg-muted transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <Link href="/" className="text-xl font-bold truncate">
                    KAVENGO
                </Link>
            </div>

            {/* Search Input */}
            <div className="hidden sm:block flex-1 max-w-lg">
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
                {mounted && canShowAdminSettings && (
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="icon" aria-label="Admin Settings" className="hidden sm:inline-flex">
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Admin Setting</span>
                        </Button>
                    </Link>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="User menu" className="hidden sm:inline-flex">
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
                    className="relative hidden sm:inline-flex"
                >
                    <Heart className={`h-5 w-5 ${mounted && wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {mounted && wishlistItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {wishlistItems.length}
                        </span>
                    )}
                    <span className="sr-only">Wishlist</span>
                </Button>
                {/* Cart Icon */}
                <Link href="/cart">
                    <Button variant="ghost" size="icon" aria-label="Cart" className="hidden sm:inline-flex">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                    </Button>
                </Link>
            </div>
        </nav>
        <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </>)
}

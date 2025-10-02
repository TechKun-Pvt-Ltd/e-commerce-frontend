"use client";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, Heart, UserRound, Settings } from "lucide-react"
import UserMenuContent from "./UserMenuContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";

export default function Header() {
    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.roleName === UserRole.ADMIN;
    const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
    const canShowAdminSettings = isAdmin || isPlatformAdmin;
    



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

                <Button variant="ghost" size="icon" aria-label="Wishlist">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Wishlist</span>
                </Button>
                {/* Cart Icon */}
                <Link href="/cart">
                    <Button variant="ghost" size="icon" aria-label="Cart">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                    </Button>
                </Link>
                {canShowAdminSettings && (
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="icon" aria-label="Admin Settings">
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Admin Setting</span>
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    </>)
}

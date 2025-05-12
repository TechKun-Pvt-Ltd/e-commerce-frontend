"use client";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, UserRound, Search, LogIn, UserPlus2Icon, Heart, Package, CircleUserRoundIcon, LogOut, ChevronDown, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSelector } from "@/store/hooks"
import { CategoryTree } from "@/types/domains/category";

const categoryTree: CategoryTree[] = [
    {
        categoryId: 1,
        name: "Men",
        path: "0",
        subcategories: [
            {
                categoryId: 11,
                name: "Clothing",
                path: "0.0",
                subcategories: [
                    { categoryId: 111, name: "Shirts", path: "0.0.0", subcategories: [] },
                    { categoryId: 112, name: "Pants", path: "0.0.1", subcategories: [] },
                ],
            },
            {
                categoryId: 12,
                name: "Shoes",
                path: "0.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 2,
        name: "Women",
        path: "1",
        subcategories: [
            {
                categoryId: 21,
                name: "Accessories",
                path: "1.0",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 3,
        name: "Kids",
        path: "2",
        subcategories: [
            {
                categoryId: 31,
                name: "Toys",
                path: "2.0",
                subcategories: [],
            },
            {
                categoryId: 32,
                name: "Clothing",
                path: "2.1",
                subcategories: [
                    { categoryId: 321, name: "T-Shirts", path: "2.1.0", subcategories: [] },
                    { categoryId: 322, name: "Shorts", path: "2.1.1", subcategories: [] },
                ],
            },
        ],
    },
    {
        categoryId: 4,
        name: "Home",
        path: "3",
        subcategories: [
            {
                categoryId: 41,
                name: "Furniture",
                path: "3.0",
                subcategories: [],
            },
            {
                categoryId: 42,
                name: "Decor",
                path: "3.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 5,
        name: "Electronics",
        path: "4",
        subcategories: [
            {
                categoryId: 51,
                name: "Mobile Phones",
                path: "4.0",
                subcategories: [],
            },
            {
                categoryId: 52,
                name: "Laptops",
                path: "4.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 6,
        name: "Sports",
        path: "5",
        subcategories: [
            {
                categoryId: 61,
                name: "Outdoor",
                path: "5.0",
                subcategories: [],
            },
            {
                categoryId: 62,
                name: "Indoor",
                path: "5.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 7,
        name: "Beauty",
        path: "6",
        subcategories: [
            {
                categoryId: 71,
                name: "Skincare",
                path: "6.0",
                subcategories: [],
            },
            {
                categoryId: 72,
                name: "Makeup",
                path: "6.1",
                subcategories: [],
            },
        ],
    },
];

function renderCategoryDropdown(category: CategoryTree) {
    if (category.subcategories.length === 0) {
        return (
            <DropdownMenuItem asChild key={category.path}>
                <Link href={`/category/${category.categoryId}`}>{category.name}</Link>
            </DropdownMenuItem>
        )
    }

    return (
        <DropdownMenuSub key={category.path}>
            <DropdownMenuSubTrigger>{category.name}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                {category.subcategories.map((sub) => renderCategoryDropdown(sub))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}


export default function Header() {
    const { authenticated } = useAppSelector(state => state.auth);
    const { items } = useAppSelector(state => state.categories);
    const visibleLimit = 6
    const categoriesOverflowing = categoryTree.length > (visibleLimit + 1);
    const visibleCategories = categoriesOverflowing ? categoryTree.slice(0, visibleLimit) : categoryTree;
    const overflowCategories = categoriesOverflowing ? categoryTree.slice(visibleLimit) : [];

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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="User menu">
                                <UserRound className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {authenticated ? (
                                <>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <CircleUserRoundIcon />
                                        <Link href="/account/settings">Account Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Package />
                                        <Link href="/account/orders">Orders</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <LogOut />
                                        Logout
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem>
                                        <LogIn />
                                        <Link href="/account/login">Login</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <UserPlus2Icon />
                                        <Link href="/account/register">Register</Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

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

        <div className="w-full border-b bg-background px-4">
            <div className="mx-auto w-max max-w-full overflow-x-auto p-2 flex gap-4" style={{scrollbarWidth: 'none'}}>
                {visibleCategories.map((category) => (
                    <DropdownMenu key={category.path}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                {category.name}
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">{category.subcategories.map(renderCategoryDropdown)}</DropdownMenuContent>
                    </DropdownMenu>
                ))}
                {overflowCategories.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="sticky right-0 bg-white">
                            <Button variant="ghost">
                                <MoreHorizontal className="h-4 w-4" /> More
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {overflowCategories.map((category) => (
                                <DropdownMenuSub key={category.path}>
                                    <DropdownMenuSubTrigger>{category.name}</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {category.subcategories.map((sub) => renderCategoryDropdown(sub))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    </>)
}

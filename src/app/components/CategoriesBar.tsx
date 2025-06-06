"use client";
import { useAppSelector } from "@/store/hooks";
import { CategoryTree } from "@/types/domains/category";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, MoreHorizontal } from "lucide-react";


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
    if (category.subcategories.length === 0)
        return <DropdownMenuItem key={category.path}>
            <Link href={`/category/${category.categoryId}`}>{category.name}</Link>
        </DropdownMenuItem>;

    return <div className="flex" key={category.path}>
        <DropdownMenuItem className="flex-1">
            <Link href={`/category/${category.categoryId}`}>{category.name}</Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
            <DropdownMenuSubTrigger />
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {category.subcategories.map(renderCategoryDropdown)}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    </div>
};


export default function CategoriesBar() {
    const { items } = useAppSelector(state => state.categories);
    const visibleLimit = 6
    const categoriesOverflowing = categoryTree.length > (visibleLimit + 1);
    const visibleCategories = categoriesOverflowing ? categoryTree.slice(0, visibleLimit) : categoryTree;
    const overflowCategories = categoriesOverflowing ? categoryTree.slice(visibleLimit) : [];

    return (
        <div className="w-full border-b bg-background px-4">
        <div className="mx-auto w-max max-w-full overflow-x-auto p-2 flex gap-4" style={{scrollbarWidth: 'none'}}>
            {visibleCategories.map((category) => (<div key={category.path} className="flex items-center">
                <DropdownMenu>
                    <button className="rounded-l-md px-3 py-2 hover:bg-secondary font-medium text-sm">
                        <Link href={`/category/${category.categoryId}`}>{category.name}</Link>
                    </button>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-r-md px-1.5 py-2 hover:bg-secondary">
                            <ChevronDown className="size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">{category.subcategories.map(renderCategoryDropdown)}</DropdownMenuContent>
                </DropdownMenu>
                </div>
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
                                    {category.subcategories.map(renderCategoryDropdown)}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    </div>
    )
}
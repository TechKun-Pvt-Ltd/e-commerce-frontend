/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";
import { ProductPreview } from "@/types/domains/product";
import { Star, MoreVertical, Copy, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useDataFetch from "@/hooks/use-data-fetch";
import { getAllProducts } from "@/services/product";
import * as productServices from "@/services/product";
import CategoriesDropdown, { CategoryDropdownNode } from "@/app/components/CategoriesDropdown";
import { useAppSelector } from "@/store/hooks";
import placeholderImage from '@/../public/placeholder-image.jpeg';
import { toast } from "sonner";

// const productPreviews: ProductPreview[] = [
//     {
//         productId: 1001,
//         productVariantId: 2001,
//         categoryId: 101, // Electronics
//         dateAdded: new Date("2023-10-01"),
//         quantityInStock: 50,
//         imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
//         price: 299.99,
//         title: "Smartphone X",
//         rating: 4.5,
//         starred: true
//     },
//     {
//         productId: 1002,
//         productVariantId: 2002,
//         categoryId: 101, // Electronics
//         dateAdded: new Date("2023-09-15"),
//         quantityInStock: 30,
//         imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
//         price: 499.99,
//         title: "Laptop Pro",
//         rating: 4.7,
//         starred: false
//     },
//     {
//         productId: 1003,
//         productVariantId: 2003,
//         categoryId: 101, // Electronics
//         dateAdded: new Date("2023-08-20"),
//         quantityInStock: 20,
//         imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
//         price: 199.99,
//         title: "Wireless Headphones",
//         rating: 4.3,
//         starred: true
//     }
// ];


export default function ProductsPage() {

    const router = useRouter();
    const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories)
    const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownNode>();
    const productsData = useDataFetch(productServices.getAllProducts);

    useEffect(() => {
        const filters = selectedCategory?.categoryId !== undefined
            ? { categoryId: selectedCategory.categoryId }
            : {};
        productsData.request(filters);
    }, [selectedCategory]);

    const handleCopy = async (product: ProductPreview, e: Event) => {
        e.stopPropagation();
        try {
            const res = await productServices.getProductById(product.productId);
            if (!res.success) throw new Error(res.error);

            const fullProduct = res.data;
            // Normalize for paste: backend shape may omit categoryId or nest it.
            const inferredCategoryId =
                (fullProduct as unknown as { categoryId?: number }).categoryId ??
                (fullProduct as unknown as { category?: { categoryId?: number } }).category?.categoryId ??
                product.categoryId;

            localStorage.setItem("copiedProduct", JSON.stringify({
                ...fullProduct,
                categoryId: inferredCategoryId,
            }));
            toast.success(`"${product.title}" copied! Open Add Product to paste.`);
        } catch {
            toast.error("Failed to copy product details.");
        }
    };

    const handleEdit = (product: ProductPreview, e: Event) => {
        e.stopPropagation();
        router.push(`/admin/products/product-form/${product.productId}`);
    };

    const handleDelete = async (product: ProductPreview, e: Event) => {
        e.stopPropagation();
        if (!confirm(`Delete "${product.title}"? This action cannot be undone.`)) return;
        try {
            await productServices.deleteProduct(product.productId);
            toast.success("Product deleted successfully.");
            productsData.request(selectedCategory?.categoryId !== undefined ? { categoryId: selectedCategory.categoryId } : {});
        } catch {
            toast.error("Failed to delete product.");
        }
    };

    const handleToggleActive = async (product: ProductPreview, e: Event) => {
        e.stopPropagation();
        const currentlyActive = product.status !== false;
        try {
            await productServices.updateProductBasicDetails(product.productId, {
                title: product.title,
                starred: product.starred,
                categoryId: product.categoryId,
                status: !currentlyActive,
            });
            toast.success(currentlyActive ? "Product deactivated." : "Product activated.");
            productsData.request(selectedCategory?.categoryId !== undefined ? { categoryId: selectedCategory.categoryId } : {});
        } catch {
            toast.error("Failed to update product status.");
        }
    };

    return <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <div className="flex justify-between items-center gap-4">
                <CategoriesDropdown selectedCategoryNode={selectedCategory} onSelect={setSelectedCategory} disabled={categoriesLoading} categories={categories} />
                <Link href="/admin/products/product-form"><Button variant="default">Add Product</Button></Link>
            </div>
        </div>
        <div className="py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsData.data?.map((product, index) => (
                <div key={index} className="relative">
                    <Link className="block w-full" href={`/admin/products/product-form/${product.productId}`}>
                        <div
                            className="rounded-md border overflow-hidden shadow-sm hover:shadow-md transition relative w-full"
                        >
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute right-2 top-2 z-10"
                                onClick={(e) => e.preventDefault()}
                            >
                                <Star className={"h-4 w-4 text-muted-foreground " + (product.starred ? "text-yellow-500 fill-yellow-500" : "")} />
                            </Button>

                            {/* Image */}
                            <Image
                                src={product.imageUrl || placeholderImage}
                                alt={product.title}
                                width={210}
                                height={200}
                                className="w-full h-auto aspect-square object-cover"
                            />

                            <div className="p-2 flex">
                                <div className="flex-1 pt-2">
                                    <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                                        {product.title}
                                    </h3>

                                    <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                        <span>{product.rating}</span>
                                        <span className="text-muted-foreground">• {product.quantityInStock} in stock</span>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-base font-bold text-foreground">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* 3-dot Dropdown */}
                                <div onClick={(e) => e.preventDefault()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem
                                                onSelect={(e) => handleCopy(product, e)}
                                            >
                                                <Copy className="h-4 w-4" />
                                                Copy Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={(e) => handleEdit(product, e)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={(e) => handleToggleActive(product, e)}
                                            >
                                                {product.status !== false
                                                    ? <><ToggleLeft className="h-4 w-4" /> Deactivate</>
                                                    : <><ToggleRight className="h-4 w-4" /> Activate</>
                                                }
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onSelect={(e) => handleDelete(product, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    </div>;
}
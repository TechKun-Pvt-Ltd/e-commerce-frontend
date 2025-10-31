"use client";
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductPreview } from "@/types/domains/product";

interface FeatureProductsProps {
    products?: ProductPreview[];
}

export const FeatureProducts = ({ products = [] }: FeatureProductsProps) => {
    const [activeTab, setActiveTab] = useState("new");
    const router = useRouter();

    // Sort and filter products based on active tab
    const filteredProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        const sortedProducts = [...products];

        switch (activeTab) {
            case "new":
                // Sort by dateAdded (newest first)
                return sortedProducts.sort((a, b) => {
                    const dateA = new Date(a.dateAdded).getTime();
                    const dateB = new Date(b.dateAdded).getTime();
                    return dateB - dateA;
                }).slice(0, 8);

            case "bestsellers":
                // Sort by rating (highest rated first)
                return sortedProducts.sort((a, b) => b.rating - a.rating).slice(0, 8);

            case "discounted":
                // Show products with promotions (for now, show all - can be enhanced later with promo data)
                return sortedProducts.slice(0, 8);

            default:
                return sortedProducts.slice(0, 8);
        }
    }, [products, activeTab]);


    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-muted/50 rounded-full p-1">
                    <TabsTrigger
                        value="new"
                        className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        NEW
                    </TabsTrigger>
                    <TabsTrigger
                        value="bestsellers"
                        className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        BEST SELLERS
                    </TabsTrigger>
                    <TabsTrigger
                        value="discounted"
                        className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        DISCOUNTED
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.productId} product={product} promo={null} />
                                ))
                            ) : (
                                <div className="col-span-4 text-center text-gray-500 py-8">
                                    No products found
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-center mt-8">
                        <Button
                            variant="ghost"
                            className="w-36 hover:bg-black rounded-full my-4 text-black hover:text-white border p-4 border-black"
                            onClick={() => router.push('/products')}
                        >
                            <ShoppingCartIcon /> All Products
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="bestsellers" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.productId} product={product} promo={null} />
                                ))
                            ) : (
                                <div className="col-span-4 text-center text-gray-500 py-8">
                                    No products found
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-center mt-8">
                        <Button
                            variant="ghost"
                            className="w-36 hover:bg-black rounded-full my-4 text-black hover:text-white border p-4 border-black"
                            onClick={() => router.push('/products')}
                        >
                            <ShoppingCartIcon /> All Products
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="discounted" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.productId} product={product} promo={null} />
                                ))
                            ) : (
                                <div className="col-span-4 text-center text-gray-500 py-8">
                                    No products found
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-center mt-8">
                        <Button
                            variant="ghost"
                            className="w-36 hover:bg-black rounded-full my-4 text-black hover:text-white border p-4 border-black"
                            onClick={() => router.push('/products')}
                        >
                            <ShoppingCartIcon /> All Products
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

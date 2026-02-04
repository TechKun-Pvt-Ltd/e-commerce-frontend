"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductPreview, ProductQueryOptions, SortOption } from "@/types/domains/product";
import * as productServices from "@/services/product";
import useDataFetch from "@/hooks/use-data-fetch";
import { useAppSelector } from "@/store/hooks";
import { getPromotionForProduct } from "@/lib/utils";

interface FeatureProductsProps {
    products?: ProductPreview[];
}

// Map tab to SortOption
const getSortOptionForTab = (tab: string): SortOption => {
    switch (tab) {
        case "new":
            return SortOption.NEWEST;
        case "bestsellers":
            return SortOption.POPULAR;
        case "discounted":
            return SortOption.POPULAR;
        default:
            return SortOption.POPULAR;
    }
};

export const FeatureProducts = ({ products: productsProp = [] }: FeatureProductsProps) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("new");
    const productsData = useDataFetch(productServices.getAllProducts);
    const promotions = useAppSelector((state) => state.promotions.items);

    // Fetch products when tab changes
    useEffect(() => {
        const filters: ProductQueryOptions = {
            sortOption: getSortOptionForTab(activeTab)
        };
        productsData.request(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Use products from API (already sorted on server) or fallback to prop
    const filteredProducts = (productsData.data || productsProp || []).slice(0, 8);


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
                                filteredProducts.map((product) => {
                                    const promo = getPromotionForProduct(product, promotions);
                                    return (
                                        <ProductCard key={product.productId} product={product} promo={promo} />
                                    );
                                })
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
                                filteredProducts.map((product) => {
                                    const promo = getPromotionForProduct(product, promotions);
                                    return (
                                        <ProductCard key={product.productId} product={product} promo={promo} />
                                    );
                                })
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
                                filteredProducts.map((product) => {
                                    const promo = getPromotionForProduct(product, promotions);
                                    return (
                                        <ProductCard key={product.productId} product={product} promo={promo} />
                                    );
                                })
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

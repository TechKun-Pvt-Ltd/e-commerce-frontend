/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useMemo, useEffect } from 'react';
import ProductCard from '@/app/components/ProductCard';
import ProductCardSkeleton from '@/app/components/ProductCardSkeleton';
import { ProductPreview, ProductQueryOptions, SortOption } from "@/types/domains/product";
import * as productServices from "@/services/product";
import useDataFetch from "@/hooks/use-data-fetch";
import { useAppSelector } from "@/store/hooks";
import { getPromotionForProduct } from "@/lib/utils";

interface BestSellerProps {
    products?: ProductPreview[];
    selectedCategoryId: number | null;
}

const BestSeller = ({ products: productsProp = [], selectedCategoryId }: BestSellerProps) => {
    const productsData = useDataFetch(productServices.getAllProducts);
    const promotions = useAppSelector((state) => state.promotions.items);

    // Fetch products with categoryId filter
    useEffect(() => {
        const filters: ProductQueryOptions = {
            sortOption: SortOption.POPULAR // Use POPULAR for best sellers (sorted by rating)
        };
        if (selectedCategoryId !== null) {
            filters.categoryId = selectedCategoryId;
        }
        productsData.request(filters);
    }, [selectedCategoryId]);

    // Use products from API (already sorted by rating) or fallback to prop
    const products = productsData.data || productsProp || [];

    const bestSellerProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        // Products are already sorted by rating from API (POPULAR sort), just take top 5
        return products.slice(0, 5);
    }, [products]);

    return (
        <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-16">
                        {selectedCategoryId !== null ? "Category Best Sellers" : "Best Sellers"}
                    </h2>
                </div>

                {productsData.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : bestSellerProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {bestSellerProducts.map((product) => {
                            const promo = getPromotionForProduct(product, promotions);
                            return (
                                <ProductCard key={product.productId} product={product} promo={promo} />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No products found
                    </div>
                )}
            </div>
        </section>
    );
};

export default BestSeller;

"use client"
import React, { useEffect, useMemo } from 'react';
import ProductCard from '@/app/components/ProductCard';
import useDataFetch from '@/hooks/use-data-fetch';
import * as productServices from "@/services/product";
import { ProductQueryOptions } from "@/types/domains/product";

interface BestSellerProps {
    selectedCategoryId: number | null;
}

const BestSeller = ({ selectedCategoryId }: BestSellerProps) => {
    const productsData = useDataFetch(productServices.getAllProducts);

    useEffect(() => {
        const filters: ProductQueryOptions = {};
        // If category is selected, filter by it; otherwise get all products
        if (selectedCategoryId !== null) {
            filters.categoryId = selectedCategoryId;
        }
        productsData.request(filters);
    }, [selectedCategoryId]);

    // Sort products by rating (best sellers) and take top 5
    const bestSellerProducts = useMemo(() => {
        if (!productsData.data) return [];
        return [...productsData.data]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
    }, [productsData.data]);

    return (
        <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-16">
                        {selectedCategoryId !== null ? "Category Best Sellers" : "Best Sellers"}
                    </h2>
                </div>

                {/* Grid Layout */}
                {bestSellerProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {bestSellerProducts.map((product) => (
                            <ProductCard key={product.productId} product={product} promo={null} />
                        ))}
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

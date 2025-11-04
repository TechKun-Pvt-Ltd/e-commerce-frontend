"use client";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BannerSection from '../products/Components/BannerSection'
import ProductGrid from '../products/Components/ProductGrid'
import BestSeller from '../products/Components/BestSeller'
import useDataFetch from '@/hooks/use-data-fetch';
import * as categoryServices from "@/services/category";
import * as productServices from "@/services/product";
import { ProductQueryOptions } from "@/types/domains/product";

export default function page() {
    const searchParams = useSearchParams();
    const allCategories = useDataFetch(categoryServices.getAllCategories);
    const productsData = useDataFetch(productServices.getAllProducts);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    useEffect(() => {
        allCategories.request();
    }, []);

    // Read category from query params and set it as initial selected category
    useEffect(() => {
        const categoryIdParam = searchParams.get('categoryId');
        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam, 10);
            if (!isNaN(categoryId)) {
                setSelectedCategoryId(categoryId);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const filters: ProductQueryOptions = {};
        if (selectedCategoryId !== null) {
            filters.categoryId = selectedCategoryId;
        }
        productsData.request(filters);
    }, [selectedCategoryId]);

    const categoriesData = allCategories.data;
    const products = productsData.data || [];

    return (
        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid
                categories={categoriesData || []}
                products={products}
                onCategoryChange={setSelectedCategoryId}
                selectedCategoryId={selectedCategoryId}
            />
            <BestSeller products={products} selectedCategoryId={selectedCategoryId} />
        </div>
    )
}
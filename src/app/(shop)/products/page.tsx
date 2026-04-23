"use client";
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BannerSection from '../products/Components/BannerSection'
import ProductGrid from '../products/Components/ProductGrid'
import BestSeller from '../products/Components/BestSeller'
import useDataFetch from '@/hooks/use-data-fetch';
import * as categoryServices from "@/services/category";

function ProductsContent() {
    const searchParams = useSearchParams();
    const allCategories = useDataFetch(categoryServices.getAllCategories);
    const { request: fetchAllCategories } = allCategories;
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    useEffect(() => {
        fetchAllCategories();
    }, [fetchAllCategories]);

    // NOTE: We intentionally do NOT auto-apply category from URL.
    // UX requirement: show ALL products first, then filter only after user selects a category.
    useEffect(() => {
        // Still react to navigation by clearing selection when user lands fresh on /products
        // (but keep current selection if user is already interacting).
        if (!searchParams.get("categoryId")) {
            setSelectedCategoryId(null);
        }
    }, [searchParams]);

    const categoriesData = allCategories.data;

    return (
        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid
                categories={categoriesData || []}
                products={[]}
                onCategoryChange={setSelectedCategoryId}
                selectedCategoryId={selectedCategoryId}
            />
            <BestSeller selectedCategoryId={selectedCategoryId} />
        </div>
    )
}

export default function page() {
    return (
        <Suspense fallback={
            <div className='container-responsive py-20 flex justify-center items-center min-h-[50vh]'>
                <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}
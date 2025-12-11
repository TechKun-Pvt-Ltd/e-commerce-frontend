"use client";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BannerSection from '../products/Components/BannerSection'
import ProductGrid from '../products/Components/ProductGrid'
import BestSeller from '../products/Components/BestSeller'
import useDataFetch from '@/hooks/use-data-fetch';
import * as categoryServices from "@/services/category";

export default function page() {
    const searchParams = useSearchParams();
    const allCategories = useDataFetch(categoryServices.getAllCategories);
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
            } else {
                setSelectedCategoryId(null);
            }
        } else {
            // If no categoryId in URL, set to null
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
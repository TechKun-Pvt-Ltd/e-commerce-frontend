"use client";
import React, { useEffect, useState } from 'react'
import BannerSection from '../products/Components/BannerSection'
import ProductGrid from '../products/Components/ProductGrid'
import BestSeller from '../products/Components/BestSeller'
import useDataFetch from '@/hooks/use-data-fetch';
import * as categoryServices from "@/services/category";

export default function page() {
    const allCategories = useDataFetch(categoryServices.getAllCategories);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    useEffect(() => {
        allCategories.request();
    }, []);

    const categoriesData = allCategories.data;

    return (
        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid
                categories={categoriesData || []}
                onCategoryChange={setSelectedCategoryId}
            />
            <BestSeller selectedCategoryId={selectedCategoryId} />
        </div>
    )
}
"use client";
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BannerSection from '../products/Components/BannerSection'
import ProductGrid from '../products/Components/ProductGrid'
import BestSeller from '../products/Components/BestSeller'
import { useAppSelector } from '@/store/hooks';

function ProductsContent() {
    const searchParams = useSearchParams();
    const categoriesData = useAppSelector((state) => state.categories.items);
    const categoryParam = searchParams.get("categoryId");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        categoryParam ? Number(categoryParam) : null
    );

    useEffect(() => {
        const catId = searchParams.get("categoryId");
        setSelectedCategoryId(catId ? Number(catId) : null);
    }, [searchParams]);

    return (
        <>
            <BannerSection />
            <ProductGrid
                categories={categoriesData || []}
                products={[]}
                onCategoryChange={setSelectedCategoryId}
                selectedCategoryId={selectedCategoryId}
            />
            <BestSeller selectedCategoryId={selectedCategoryId} />
        </>
    )
}

export default function page() {
    return (
        <Suspense fallback={
            <div className='responsive-container py-20 flex justify-center items-center min-h-[50vh]'>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}

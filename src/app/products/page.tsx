"use client";
import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import Filters from './components/Filters';
import ProductGrid from './components/ProductGrid';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchProducts } from '@/app/store/slices/productsSlice';

export default function Products() {
  const dispatch = useAppDispatch();
  const { items: products, loading, error } = useAppSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [priceRange, setPriceRange] = useState<[number, number]>([39, 60]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeroSection />

      <div className="border-t border-gray-200 my-8"></div>

      <div className="flex flex-col lg:flex-row">
        <Filters
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedColors={selectedColors}
          onColorsSelected={setSelectedColors}
          selectedSizes={selectedSizes}
          onSizesSelected={setSelectedSizes}
        />
        <ProductGrid products={products} onProductClick={pId => router.push('/products/' + pId)} />
      </div>
    </div>
  );
}
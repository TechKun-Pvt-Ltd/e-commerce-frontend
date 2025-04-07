// pages/index.tsx
"use client";
import React, { useState } from 'react';
import HeroSection from './products/components/HeroSection';
import Filters from './products/components/Filters';
import ProductGrid from './products/components/ProductGrid';
import { Product } from './types/models';

export default function Home() {
  // Mock products with the correct Product type
  const products: Product[] = [
    {
      productId: 1,
      name: 'Suspended',
      description: 'Beautiful suspended art piece',
      images: [],
      variants: [
        {
          productVariantId: 1,
          name: 'Suspended (Small)',
          price: 39.90,
          sizeOption: { sizeOptionId: 1, value: 'Small (8x10)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        },
        {
          productVariantId: 2,
          name: 'Suspended (Medium)',
          price: 49.90,
          sizeOption: { sizeOptionId: 2, value: 'Medium (16x20)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        }
      ]
    },
    {
      productId: 2,
      name: 'Pathways',
      description: 'Stunning pathways art piece',
      images: [],
      variants: [
        {
          productVariantId: 3,
          name: 'Pathways (Small)',
          price: 39.90,
          sizeOption: { sizeOptionId: 1, value: 'Small (8x10)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        },
        {
          productVariantId: 4,
          name: 'Pathways (Medium)',
          price: 49.90,
          sizeOption: { sizeOptionId: 2, value: 'Medium (16x20)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        }
      ]
    },
    {
      productId: 3,
      name: 'Dreamstate No.4',
      description: 'Ethereal dreamstate art piece',
      images: [],
      variants: [
        {
          productVariantId: 5,
          name: 'Dreamstate No.4 (Small)',
          price: 49.90,
          sizeOption: { sizeOptionId: 1, value: 'Small (8x10)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        }
      ]
    },
    {
      productId: 4,
      name: 'Time Went by',
      description: 'Nostalgic time-themed art piece',
      images: [],
      variants: [
        {
          productVariantId: 6,
          name: 'Time Went by (Small)',
          price: 39.90,
          sizeOption: { sizeOptionId: 1, value: 'Small (8x10)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        }
      ]
    },
    {
      productId: 5,
      name: 'Step by Step',
      description: 'Progressive step-themed art piece',
      images: [],
      variants: [
        {
          productVariantId: 7,
          name: 'Step by Step (Small)',
          price: 59.90,
          sizeOption: { sizeOptionId: 1, value: 'Small (8x10)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        }
      ]
    },
    {
      productId: 6,
      name: 'Mothi',
      description: 'Elegant mothi-themed art piece',
      images: [],
      variants: [
        {
          productVariantId: 8,
          name: 'Mothi (Small)',
          price: 39.90,
          sizeOption: { sizeOptionId: 1, value: 'Small (8x10)' },
          frameOption: { frameOptionId: 1, value: 'Black Wood' }
        }
      ]
    }
  ];

  const [priceRange, setPriceRange] = useState<[number, number]>([39, 60]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeroSection />

      <div className="border-t border-gray-200 my-8"></div>

      <div className="flex flex-col lg:flex-row">
        <Filters
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedSizes={selectedSizes}
          onSizesSelected={setSelectedSizes}
          selectedCategories={selectedCategories}
          onCategoriesSelected={setSelectedCategories}
        />
        <ProductGrid products={products} onProductClick={(productId) => window.location.href = `/products/${productId}`} />
      </div>
    </div>
  );
}
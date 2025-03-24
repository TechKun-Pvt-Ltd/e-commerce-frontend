// pages/index.tsx
"use client";
import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import Filters from './components/Filters';
import ProductGrid from './components/ProductGrid';

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  onSale: boolean;
  image: string;
};

export default function Home() {
  const products: Product[] = [
    {
      id: 1,
      name: 'Suspended',
      price: 39.90,
      originalPrice: 49.90,
      onSale: true,
      image: ''
    },
    {
      id: 2,
      name: 'Pathways',
      price: 39.90,
      originalPrice: 49.90,
      onSale: true,
      image: ''
    },
    {
      id: 3,
      name: 'Dreamstate No.4',
      price: 49.90,
      onSale: false,
      image: '/dreamstate-no4.jpg'
    },
    {
      id: 4,
      name: 'Time Went by',
      price: 39.90,
      onSale: false,
      image: '/time-went-by.jpg'
    },
    {
      id: 5,
      name: 'Step by Step',
      price: 59.90,
      onSale: false,
      image: '/step-by-step.jpg'
    },
    {
      id: 6,
      name: 'Mothi',
      price: 39.90,
      onSale: false,
      image: '/mothi.jpg'
    },
  ];

  const [priceRange, setPriceRange] = useState<[number, number]>([39, 60]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeroSection />

      <div className="border-t border-gray-200 my-8"></div>

      <div className="flex flex-col lg:flex-row">
        <Filters
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
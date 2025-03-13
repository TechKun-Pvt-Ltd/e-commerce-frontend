// components/ProductGrid.tsx
"use client";
import React from 'react';
import Image from 'next/image';

// Define the Product type for better type safety
type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  onSale: boolean;
  image: string;
};

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="lg:w-3/4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            <div className="relative mb-4 overflow-hidden rounded-lg">
              {product.onSale && (
                <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-medium z-10 rounded-lg">
                  SALE
                </div>
              )}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="aspect-w-4 aspect-h-5 bg-gray-50">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={400} 
                    height={500}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
            <h3 className="text-gray-800 text-sm font-medium mb-1">{product.name}</h3>
            <div className="flex items-center">
              {product.onSale && (
                <span className="text-gray-500 line-through mr-2 text-sm">${product.originalPrice?.toFixed(2)}</span>
              )}
              <span className="font-medium text-sm">${product.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
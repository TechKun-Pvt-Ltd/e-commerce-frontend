"use client";
import React, { useState } from 'react';
import Image from 'next/image';

import { Product } from '@/app/types/models';

const ProductGrid: React.FC<{
  products: Product[];
  onProductClick: (productId: number) => void;
}> = ({ products, onProductClick }) => {
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});

  return (
    <div className="px-4 lg:w-3/4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.productId} className="group relative cursor-pointer" onClick={() => onProductClick(product.productId)}>
            <div className="relative mb-4 overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
              {product.variants.length > 1 && (
                <div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 text-xs font-semibold z-10 rounded-full">
                  SALE
                </div>
              )}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="aspect-w-4 aspect-h-5 h-[200px]">
                  {imageError[product.productId] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500 p-4">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎨</div>
                        <div className="text-sm text-gray-600">{product.name}</div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={`/images/products/${product.productId}.jpg`}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover transform transition-all duration-300 group-hover:scale-105"
                      onError={() => setImageError(prev => ({ ...prev, [product.productId]: true }))}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-gray-900 font-medium text-sm transition-colors duration-200 group-hover:text-blue-600">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-gray-900">
                  ${Math.min(...product.variants.map(v => v.price)).toFixed(2)} - ${Math.max(...product.variants.map(v => v.price)).toFixed(2)}
                </span>
              </div>
              <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium opacity-0 transform translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
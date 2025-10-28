"use client";
import ProductCard from "@/app/components/ProductCard";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import FilterSidebar from "./FilterSidebar";
import useDataFetch from "@/hooks/use-data-fetch";
import * as productServices from "@/services/product";
import { ProductQueryOptions } from "@/types/domains/product";
import { CategoryTree } from "@/types/domains/category";

interface ProductGridProps {
   categories: CategoryTree[];
}

const ProductGrid = ({ categories }: ProductGridProps) => {
   const productsData = useDataFetch(productServices.getAllProducts);
   const [gridColumns, setGridColumns] = useState(4);
   const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
   const [currentCategory, setCurrentCategory] = useState<CategoryTree | null>(null);

   useEffect(() => {
      const filters: ProductQueryOptions = {};
      if (selectedCategoryIds.length > 0) {
         // Use first selected category for filtering (can be extended to multiple)
         filters.categoryId = selectedCategoryIds[0];
      }
      productsData.request(filters);
   }, [selectedCategoryIds]);

   const handleCategoryChange = (categoryIds: number[]) => {
      setSelectedCategoryIds(categoryIds);
      // Set current category for breadcrumbs
      if (categoryIds.length > 0) {
         const foundCategory = findCategoryById(categories, categoryIds[0]);
         setCurrentCategory(foundCategory || null);
      } else {
         setCurrentCategory(null);
      }
   };

   const findCategoryById = (cats: CategoryTree[], id: number): CategoryTree | null => {
      for (const cat of cats) {
         if (cat.categoryId === id) return cat;
         if (cat.subcategories && cat.subcategories.length > 0) {
            const found = findCategoryById(cat.subcategories, id);
            if (found) return found;
         }
      }
      return null;
   };


   const getGridClass = () => {
      switch (gridColumns) {
         case 2:
            return "grid-cols-2";
         case 3:
            return "grid-cols-3";
         case 4:
            return "grid-cols-4";
         default:
            return "grid-cols-4";
      }
   };

   return (
      <section className="bg-white">
         <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
               <BreadcrumbList>
                  <BreadcrumbItem>
                     <BreadcrumbLink href="/" className="">
                        Home
                     </BreadcrumbLink>
                  </BreadcrumbItem>
                  {(currentCategory || selectedCategoryIds.length > 0) && (
                     <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                           <BreadcrumbPage>{currentCategory?.name || "Products"}</BreadcrumbPage>
                        </BreadcrumbItem>
                     </>
                  )}
               </BreadcrumbList>
            </Breadcrumb>

            <div className="flex gap-6">
               {/* Sidebar */}
               <aside className="flex-shrink-0">
                  <FilterSidebar categories={categories} onCategoryChange={handleCategoryChange} />
               </aside>

               <main className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-5 border p-2 rounded">
                        {/* 2 columns */}
                        <button
                           onClick={() => setGridColumns(2)}
                           className={`cursor-pointer transition-colors duration-300 ${gridColumns === 2 ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
                              }`}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 18" fill="none">
                              <rect width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect y="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect x="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect x="9" y="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                           </svg>
                        </button>

                        {/* 3 columns */}
                        <button
                           onClick={() => setGridColumns(3)}
                           className={`cursor-pointer transition-colors duration-300 ${gridColumns === 3 ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
                              }`}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="26" height="17" viewBox="0 0 26 18" fill="none">
                              <rect width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect y="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect x="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect x="18" width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect x="9" y="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                              <rect x="18" y="9" width="8" height="8" rx="2" fill="currentColor"></rect>
                           </svg>
                        </button>

                        {/* 4 columns */}
                        <button
                           onClick={() => setGridColumns(4)}
                           className={`cursor-pointer transition-colors duration-300 ${gridColumns === 4 ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
                              }`}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="23" height="17" viewBox="0 0 23 18" fill="none">
                              <rect y="12" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="6" y="12" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="12" y="12" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="18" y="12" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect y="6" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="6" y="6" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="12" y="6" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="18" y="6" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="6" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="12" width="5" height="5" rx="1" fill="currentColor"></rect>
                              <rect x="18" width="5" height="5" rx="1" fill="currentColor"></rect>
                           </svg>
                        </button>
                     </div>

                     <div className="flex items-center gap-2 text-sm">
                        <span>Sort by:</span>
                        <Select defaultValue="popular">
                           <SelectTrigger className="w-24 h-8 text-sm border-gray-300">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="popular">Popular</SelectItem>
                              <SelectItem value="newest">Newest</SelectItem>
                              <SelectItem value="price-low">Price: Low to High</SelectItem>
                              <SelectItem value="price-high">Price: High to Low</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {/* Products Grid */}
                  <div className={`grid ${getGridClass()} gap-6 py-6 ${gridColumns === 2 ? "justify-center" : ""}`}>
                     {productsData.data?.slice(0, 8).map((product) => (
                        <ProductCard key={product.productId} product={product} promo={null} />
                     ))}
                  </div>
               </main>
            </div>
         </div>
      </section>
   );
};

export default ProductGrid;

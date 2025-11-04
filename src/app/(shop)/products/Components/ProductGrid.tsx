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
import { useState, useEffect } from "react";
import FilterSidebar from "./FilterSidebar";
import { ProductPreview } from "@/types/domains/product";
import { CategoryTree } from "@/types/domains/category";

interface ProductGridProps {
   categories: CategoryTree[];
   products: ProductPreview[];
   onCategoryChange?: (categoryId: number | null) => void;
   selectedCategoryId?: number | null;
}

const ProductGrid = ({ categories, products, onCategoryChange: onCategoryChangeProp, selectedCategoryId: selectedCategoryIdProp }: ProductGridProps) => {
   const [gridColumns, setGridColumns] = useState(4);
   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(selectedCategoryIdProp || null);
   const [currentCategory, setCurrentCategory] = useState<CategoryTree | null>(null);
   const [sortBy, setSortBy] = useState<string>("popular");

   // Sync internal state with prop when it changes
   useEffect(() => {
      if (selectedCategoryIdProp !== undefined) {
         setSelectedCategoryId(selectedCategoryIdProp);
         // Set current category for breadcrumbs
         if (selectedCategoryIdProp !== null) {
            const foundCategory = findCategoryById(categories, selectedCategoryIdProp);
            setCurrentCategory(foundCategory || null);
         } else {
            setCurrentCategory(null);
         }
      }
   }, [selectedCategoryIdProp, categories]);

   const handleCategoryChange = (categoryId: number | null) => {
      setSelectedCategoryId(categoryId);
      // Set current category for breadcrumbs
      if (categoryId !== null) {
         const foundCategory = findCategoryById(categories, categoryId);
         setCurrentCategory(foundCategory || null);
      } else {
         setCurrentCategory(null);
      }
      // Notify parent component about category change
      if (onCategoryChangeProp) {
         onCategoryChangeProp(categoryId);
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

   // Sort products based on selected sort option
   const sortedProducts = products ? [...products].sort((a, b) => {
      switch (sortBy) {
         case "popular":
            // Sort by rating (descending)
            return b.rating - a.rating;

         case "newest":
            // Sort by dateAdded (descending - newest first)
            const dateA = new Date(a.dateAdded).getTime();
            const dateB = new Date(b.dateAdded).getTime();
            return dateB - dateA;

         case "price-low":
            // Sort by price (ascending)
            return a.price - b.price;

         case "price-high":
            // Sort by price (descending)
            return b.price - a.price;

         default:
            return 0;
      }
   }) : [];

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
                  {(currentCategory || selectedCategoryId !== null) && (
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
                  <FilterSidebar 
                     categories={categories} 
                     onCategoryChange={handleCategoryChange}
                     selectedCategoryId={selectedCategoryId}
                  />
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
                        <Select value={sortBy} onValueChange={setSortBy}>
                           <SelectTrigger className="w-48 h-8 text-sm border-gray-300">
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
                     {sortedProducts.slice(0, 8).map((product) => (
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

/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ProductCard from "@/app/components/ProductCard";
import ProductCardSkeleton from "@/app/components/ProductCardSkeleton";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
   Pagination,
   PaginationContent,
   PaginationEllipsis,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect, useMemo } from "react";
import FilterSidebar from "./FilterSidebar";
import { ProductPreview, ProductQueryOptions, SortOption } from "@/types/domains/product";
import { CategoryTree } from "@/types/domains/category";
import * as productServices from "@/services/product";
import useDataFetch from "@/hooks/use-data-fetch";
import { useAppSelector } from "@/store/hooks";
import { getPromotionForProduct } from "@/lib/utils";

interface ProductGridProps {
   categories: CategoryTree[];
   products: ProductPreview[];
   onCategoryChange?: (categoryId: number | null) => void;
   selectedCategoryId?: number | null;
}



const ProductGrid = ({ categories, products: productsProp, onCategoryChange: onCategoryChangeProp, selectedCategoryId: selectedCategoryIdProp }: ProductGridProps) => {
   const [gridColumns, setGridColumns] = useState(4);
   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(selectedCategoryIdProp || null);
   const [currentCategory, setCurrentCategory] = useState<CategoryTree | null>(null);
   const [sortBy, setSortBy] = useState<SortOption>(SortOption.POPULAR);
   const [currentPage, setCurrentPage] = useState(1);
   const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
   const itemsPerPage = 8;
   const productsData = useDataFetch(productServices.getAllProducts);
   const promotions = useAppSelector((state) => state.promotions.items);

   // Fetch products with sorting when sortBy or selectedCategoryId changes
   useEffect(() => {
      const filters: ProductQueryOptions = {
         sortOption: sortBy,
         status: true,
      };
      if (selectedCategoryId !== null) {
         filters.categoryId = selectedCategoryId;
      }
      productsData.request(filters);
      // Reset to page 1 when filters change
      setCurrentPage(1);
   }, [sortBy, selectedCategoryId]);

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
            // Mobile should always stay readable; keep 2 cols on small screens.
            return "grid-cols-2 md:grid-cols-2 lg:grid-cols-2";
         case 3:
            return "grid-cols-2 md:grid-cols-3 lg:grid-cols-3";
         case 4:
            return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
         default:
            return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      }
   };

   // Use products from API (already sorted on server) or fallback to prop
   // Extra safety: if backend doesn't filter by status yet, hide inactive products in UI.
   const products = useMemo(() => {
      const base = (productsData.data || productsProp || []).filter((p) => p.status !== false);
      const [minP, maxP] = priceRange;
      return base.filter((p) => p.price >= minP && p.price <= maxP);
   }, [productsData.data, productsProp, priceRange]);

   // Pagination calculations
   const totalPages = Math.ceil(products.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const currentPageProducts = useMemo(() => {
      return products.slice(startIndex, endIndex);
   }, [products, startIndex, endIndex]);

   // Generate page numbers to display
   const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
         // Show all pages if total pages is less than max visible
         for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
         }
      } else {
         // Always show first page
         pages.push(1);

         if (currentPage <= 3) {
            // Show first few pages
            for (let i = 2; i <= 4; i++) {
               pages.push(i);
            }
            pages.push("ellipsis");
            pages.push(totalPages);
         } else if (currentPage >= totalPages - 2) {
            // Show last few pages
            pages.push("ellipsis");
            for (let i = totalPages - 3; i <= totalPages; i++) {
               pages.push(i);
            }
         } else {
            // Show pages around current page
            pages.push("ellipsis");
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
               pages.push(i);
            }
            pages.push("ellipsis");
            pages.push(totalPages);
         }
      }

      return pages;
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

            <div className="flex flex-col lg:flex-row gap-6">
               {/* Sidebar (desktop) */}
               <aside className="hidden lg:block flex-shrink-0">
                  <FilterSidebar
                     categories={categories}
                     onCategoryChange={handleCategoryChange}
                     selectedCategoryId={selectedCategoryId}
                     priceRange={priceRange}
                     onPriceRangeChange={(r) => {
                        setPriceRange(r);
                        setCurrentPage(1);
                     }}
                  />
               </aside>

               <main className="flex-1">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <div className="flex items-center justify-between gap-3">
                        {/* Filters (mobile/tablet) */}
                        <div className="lg:hidden">
                           <Sheet>
                              <SheetTrigger asChild>
                                 <Button variant="outline" size="sm">
                                    Filters
                                 </Button>
                              </SheetTrigger>
                              <SheetContent side="left" className="p-0 w-[90vw] sm:w-[420px]">
                                 <SheetHeader className="p-4 border-b">
                                    <SheetTitle>Filters</SheetTitle>
                                 </SheetHeader>
                                 <div className="h-[calc(100vh-57px)] overflow-auto">
                                    <FilterSidebar
                                       categories={categories}
                                       onCategoryChange={handleCategoryChange}
                                       selectedCategoryId={selectedCategoryId}
                                       priceRange={priceRange}
                                       onPriceRangeChange={(r) => {
                                          setPriceRange(r);
                                          setCurrentPage(1);
                                       }}
                                    />
                                 </div>
                              </SheetContent>
                           </Sheet>
                        </div>

                        {/* Grid toggle (desktop/tablet only) */}
                        <div className="hidden sm:flex items-center gap-5 border p-2 rounded">
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
                     </div>

                     <div className="flex items-center justify-between sm:justify-start gap-2 text-sm">
                        <span className="shrink-0">Sort by:</span>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                           <SelectTrigger className="w-48 h-8 text-sm border-gray-300">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value={SortOption.POPULAR}>Popular</SelectItem>
                              <SelectItem value={SortOption.NEWEST}>Newest</SelectItem>
                              <SelectItem value={SortOption.PRICE_LOW_TO_HIGH}>Price: Low to High</SelectItem>
                              <SelectItem value={SortOption.PRICE_HIGH_TO_LOW}>Price: High to Low</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {/* Products Grid */}
                  <div className={`grid ${getGridClass()} gap-4 sm:gap-6 py-6 ${gridColumns === 2 ? "justify-center" : ""}`}>
                     {productsData.isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                           <ProductCardSkeleton key={i} />
                        ))
                     ) : currentPageProducts.length > 0 ? (
                        currentPageProducts.map((product) => {
                           const promo = getPromotionForProduct(product, promotions);
                           return (
                              <ProductCard key={product.productId} product={product} promo={promo} />
                           );
                        })
                     ) : (
                        <div className="col-span-full text-center text-gray-500 py-8">
                           No products found
                        </div>
                     )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="mt-8">
                        <Pagination>
                           <PaginationContent>
                              <PaginationItem>
                                 <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                       e.preventDefault();
                                       if (currentPage > 1) {
                                          setCurrentPage(currentPage - 1);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                       }
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                 />
                              </PaginationItem>

                              {getPageNumbers().map((page, index) => (
                                 <PaginationItem key={index}>
                                    {page === "ellipsis" ? (
                                       <PaginationEllipsis />
                                    ) : (
                                       <PaginationLink
                                          href="#"
                                          onClick={(e) => {
                                             e.preventDefault();
                                             setCurrentPage(page as number);
                                             window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          isActive={currentPage === page}
                                          className="cursor-pointer"
                                       >
                                          {page}
                                       </PaginationLink>
                                    )}
                                 </PaginationItem>
                              ))}

                              <PaginationItem>
                                 <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                       e.preventDefault();
                                       if (currentPage < totalPages) {
                                          setCurrentPage(currentPage + 1);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                       }
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                 />
                              </PaginationItem>
                           </PaginationContent>
                        </Pagination>
                     </div>
                  )}
               </main>
            </div>
         </div>
      </section>
   );
};

export default ProductGrid;

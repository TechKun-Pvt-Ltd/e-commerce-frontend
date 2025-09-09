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
import { useState } from "react";
import FilterSidebar from "./FilterSidebar";

const products: any[] = [
   {
      productId: 101,
      productVariantId: 201,
      categoryId: 12,
      dateAdded: "2025-08-07T10:00:00Z",
      quantityInStock: 75,
      imageUrl: "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
      price: 499.0,
      title: "Classic Wooden Photo Frame",
      code: "FRAME-WD-2025",
      rating: 4.6,
      starred: true,
   },
   {
      productId: 102,
      productVariantId: 202,
      categoryId: 12,
      dateAdded: "2025-08-06T12:30:00Z",
      quantityInStock: 60,
      imageUrl: "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
      price: 599.0,
      title: "Minimalist Black Frame",
      code: "FRAME-BLK-2025",
      rating: 4.8,
      starred: false,
   },
   {
      productId: 103,
      productVariantId: 203,
      categoryId: 12,
      dateAdded: "2025-08-04T15:15:00Z",
      quantityInStock: 45,
      imageUrl: "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
      price: 749.0,
      title: "Golden Antique Frame",
      code: "FRAME-GLD-2025",
      rating: 4.9,
      starred: true,
   },
   {
      productId: 104,
      productVariantId: 201,
      categoryId: 12,
      dateAdded: "2025-08-07T10:00:00Z",
      quantityInStock: 75,
      imageUrl: "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
      price: 499.0,
      title: "Classic Wooden Photo Frame",
      code: "FRAME-WD-2025",
      rating: 4.6,
      starred: true,
   },
   {
      productId: 105,
      productVariantId: 202,
      categoryId: 12,
      dateAdded: "2025-08-06T12:30:00Z",
      quantityInStock: 60,
      imageUrl: "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
      price: 599.0,
      title: "Minimalist Black Frame",
      code: "FRAME-BLK-2025",
      rating: 4.8,
      starred: false,
   },
   {
      productId: 106,
      productVariantId: 203,
      categoryId: 12,
      dateAdded: "2025-08-04T15:15:00Z",
      quantityInStock: 45,
      imageUrl: "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
      price: 749.0,
      title: "Golden Antique Frame",
      code: "FRAME-GLD-2025",
      rating: 4.9,
      starred: true,
   },
   {
      productId: 107,
      productVariantId: 201,
      categoryId: 12,
      dateAdded: "2025-08-07T10:00:00Z",
      quantityInStock: 75,
      imageUrl: "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
      price: 499.0,
      title: "Classic Wooden Photo Frame",
      code: "FRAME-WD-2025",
      rating: 4.6,
      starred: true,
   },
   {
      productId: 108,
      productVariantId: 202,
      categoryId: 12,
      dateAdded: "2025-08-06T12:30:00Z",
      quantityInStock: 60,
      imageUrl: "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
      price: 599.0,
      title: "Minimalist Black Frame",
      code: "FRAME-BLK-2025",
      rating: 4.8,
      starred: false,
   },
];

// Recommended products for carousel
const recommendedProducts = [
   {
      productId: 201,
      productVariantId: 301,
      categoryId: 12,
      dateAdded: "2025-08-05T14:20:00Z",
      quantityInStock: 30,
      imageUrl: "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
      price: 799.0,
      title: "Premium Silver Frame",
      code: "FRAME-SLV-2025",
      rating: 4.7,
      starred: false,
   },
   {
      productId: 202,
      productVariantId: 302,
      categoryId: 12,
      dateAdded: "2025-08-03T09:45:00Z",
      quantityInStock: 25,
      imageUrl: "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
      price: 649.0,
      title: "Modern White Frame",
      code: "FRAME-WHT-2025",
      rating: 4.5,
      starred: true,
   },
   {
      productId: 203,
      productVariantId: 303,
      categoryId: 12,
      dateAdded: "2025-08-02T16:30:00Z",
      quantityInStock: 40,
      imageUrl: "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
      price: 899.0,
      title: "Elegant Rose Gold Frame",
      code: "FRAME-RG-2025",
      rating: 4.8,
      starred: false,
   },
   {
      productId: 204,
      productVariantId: 304,
      categoryId: 12,
      dateAdded: "2025-08-01T11:15:00Z",
      quantityInStock: 35,
      imageUrl: "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
      price: 549.0,
      title: "Rustic Brown Frame",
      code: "FRAME-BRN-2025",
      rating: 4.4,
      starred: true,
   },
   {
      productId: 205,
      productVariantId: 305,
      categoryId: 12,
      dateAdded: "2025-07-31T13:00:00Z",
      quantityInStock: 50,
      imageUrl: "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
      price: 699.0,
      title: "Contemporary Black Frame",
      code: "FRAME-CB-2025",
      rating: 4.6,
      starred: false,
   },
];

const ProductGrid = () => {
   const [gridColumns, setGridColumns] = useState(4);

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
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                     <BreadcrumbPage>Clothes</BreadcrumbPage>
                  </BreadcrumbItem>
               </BreadcrumbList>
            </Breadcrumb>

            <div className="flex gap-6">
               {/* Sidebar */}
               <aside className="flex-shrink-0">
                  <FilterSidebar />
               </aside>

               <main className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-5 border p-2 rounded">
                        {/* 2 columns */}
                        <button
                           onClick={() => setGridColumns(2)}
                           className={`cursor-pointer transition-colors duration-300 ${
                              gridColumns === 2 ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
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
                           className={`cursor-pointer transition-colors duration-300 ${
                              gridColumns === 3 ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
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
                           className={`cursor-pointer transition-colors duration-300 ${
                              gridColumns === 4 ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
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
                     {products.slice(0, 8).map((product) => (
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

"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import { PromotionDetails } from "@/types/domains/promotion";
import { ProductPreview } from "@/types/domains/product";
import { Button } from "@/components/ui/button";
import { type ClassValue } from 'clsx';


const products: any[] = [
    {
        "productId": 101,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true

    },
    {
        "productId": 102,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 103,
        "productVariantId": 203,
        "categoryId": 12,
        "dateAdded": "2025-08-04T15:15:00Z",
        "quantityInStock": 45,
        "imageUrl": "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
        "price": 749.00,
        "title": "Golden Antique Frame",
        "code": "FRAME-GLD-2025",
        "rating": 4.9,
        "starred": true
    }, {
        "productId": 104,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true

    },
    {
        "productId": 105,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 106,
        "productVariantId": 203,
        "categoryId": 12,
        "dateAdded": "2025-08-04T15:15:00Z",
        "quantityInStock": 45,
        "imageUrl": "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
        "price": 749.00,
        "title": "Golden Antique Frame",
        "code": "FRAME-GLD-2025",
        "rating": 4.9,
        "starred": true
    }, {
        "productId": 107,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true

    },
    {
        "productId": 108,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },


];

export const FeatureProducts = () => {
    const [activeTab, setActiveTab] = useState("new");


    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-muted/50 rounded-full p-1">
                    <TabsTrigger
                        value="new"
                        className="rounded-full font-medium data-[state=active]:bg-white data-[state=active]:text-gallery-tab-active data-[state=active]:shadow-sm"
                    >
                        NEW
                    </TabsTrigger>
                    <TabsTrigger
                        value="bestsellers"
                        className="rounded-full font-medium data-[state=active]:bg-white data-[state=active]:text-gallery-tab-active data-[state=active]:shadow-sm"
                    >
                        BEST SELLERS
                    </TabsTrigger>
                    <TabsTrigger
                        value="discounted"
                        className="rounded-full font-medium data-[state=active]:bg-white data-[state=active]:text-gallery-tab-active data-[state=active]:shadow-sm"
                    >
                        DISCOUNTED
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            products.map((product) => (
                                <ProductCard key={product.productId} product={product} promo={null} />
                            ))
                        }

                    </div>
                    <div className="flex items-center justify-center mt-8  ">
                        <Button variant="ghost" className="w-32 hover:bg-white hover:border-white rounded-full  my-4 text-black border p-4 border-black">
                            All Products
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="bestsellers" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

                        {
                            products.map((product) => (
                                <ProductCard key={product.productId} product={product} promo={null} />
                            ))
                        }
                    </div>
                    <div className="flex items-center justify-center mt-8  ">
                        <Button variant="ghost" className="w-32 hover:bg-white hover:border-white rounded-full  my-4 text-black border p-4 border-black">
                            All Products
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="discounted" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

                        {
                            products.map((product) => (
                                <ProductCard key={product.productId} product={product} promo={null} />
                            ))
                        }
                    </div>
                    <div className="flex items-center justify-center mt-8 ">
                        <Button variant="ghost" className="w-32 hover:bg-white hover:border-white rounded-full  my-4 text-black border p-4 border-black">
                            All Products
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

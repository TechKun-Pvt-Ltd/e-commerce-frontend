"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";


const products: any[] = [
    {
        "productId": 101,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/b8/98/4e/b8984e1d41ef5987dcd45d239aa641fd.jpg",
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
        "imageUrl": "https://i.pinimg.com/1200x/93/3b/f1/933bf196b3e96ad63cf7e28537008244.jpg",
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
        "imageUrl": "https://i.pinimg.com/736x/27/89/70/278970ef6800d537b042bbebb142473d.jpg",
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
        "imageUrl": "https://i.pinimg.com/1200x/14/6c/20/146c20591a0c03ad90c8a08f42cf3624.jpg",
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
        "imageUrl": "https://i.pinimg.com/1200x/35/ca/d9/35cad961cbbc05fa924bf8054b0e01bb.jpg",
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
        "imageUrl": "https://i.pinimg.com/736x/42/de/7b/42de7bb703fca6d7b52b68c2affd949f.jpg",
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
        "imageUrl": "https://i.pinimg.com/1200x/8e/1d/81/8e1d81152c50bb4ace7609fe6a10491e.jpg",
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
                        className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        NEW
                    </TabsTrigger>
                    <TabsTrigger
                        value="bestsellers"
                        className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        BEST SELLERS
                    </TabsTrigger>
                    <TabsTrigger
                        value="discounted"
                        className="rounded-full cursor-pointer transition-all duration-300 ease-in-out font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
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
                        <Button variant="ghost" className="w-36 hover:bg-black  rounded-full  my-4 text-black hover:text-white border p-4 border-black">
                            <ShoppingCartIcon />     All Products
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
                        <Button variant="ghost" className="w-36 hover:bg-black  rounded-full  my-4 text-black hover:text-white border p-4 border-black">
                            <ShoppingCartIcon />    All Products
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
                        <Button variant="ghost" className="w-36 hover:bg-black  rounded-full  my-4 text-black hover:text-white border p-4 border-black">
                            <ShoppingCartIcon />  All Products
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

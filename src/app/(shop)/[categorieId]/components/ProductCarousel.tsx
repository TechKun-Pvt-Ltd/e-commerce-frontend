"use client"
import React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from '@/app/components/ProductCard';

const carouselProducts: any[] = [
    {
        "productId": 301,
        "productVariantId": 401,
        "categoryId": 15,
        "dateAdded": "2025-08-10T10:00:00Z",
        "quantityInStock": 50,
        "imageUrl": "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
        "price": 899.00,
        "title": "Premium Leather Wallet",
        "code": "WALLET-LTR-2025",
        "rating": 4.7,
        "starred": true
    },
    {
        "productId": 302,
        "productVariantId": 402,
        "categoryId": 15,
        "dateAdded": "2025-08-09T14:30:00Z",
        "quantityInStock": 35,
        "imageUrl": "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
        "price": 1299.00,
        "title": "Designer Sunglasses",
        "code": "GLASS-DSN-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 303,
        "productVariantId": 403,
        "categoryId": 15,
        "dateAdded": "2025-08-08T16:45:00Z",
        "quantityInStock": 25,
        "imageUrl": "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
        "price": 2199.00,
        "title": "Smart Watch Pro",
        "code": "WATCH-SMP-2025",
        "rating": 4.9,
        "starred": true
    },
    {
        "productId": 304,
        "productVariantId": 404,
        "categoryId": 15,
        "dateAdded": "2025-08-07T11:20:00Z",
        "quantityInStock": 40,
        "imageUrl": "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
        "price": 799.00,
        "title": "Wireless Headphones",
        "code": "HEAD-WRL-2025",
        "rating": 4.6,
        "starred": false
    },
    {
        "productId": 305,
        "productVariantId": 405,
        "categoryId": 15,
        "dateAdded": "2025-08-06T09:15:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
        "price": 599.00,
        "title": "Canvas Backpack",
        "code": "BAG-CNV-2025",
        "rating": 4.5,
        "starred": true
    },
    {
        "productId": 306,
        "productVariantId": 406,
        "categoryId": 15,
        "dateAdded": "2025-08-05T13:40:00Z",
        "quantityInStock": 30,
        "imageUrl": "https://i.pinimg.com/736x/c8/bd/7a/c8bd7accaa4325a8b0a35b712640e27c.jpg",
        "price": 1599.00,
        "title": "Mechanical Keyboard",
        "code": "KEY-MCH-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 307,
        "productVariantId": 407,
        "categoryId": 15,
        "dateAdded": "2025-08-04T15:25:00Z",
        "quantityInStock": 45,
        "imageUrl": "https://i.pinimg.com/1200x/42/15/50/4215508d64e60b2e268d8f38658753d9.jpg",
        "price": 399.00,
        "title": "Ceramic Coffee Mug",
        "code": "MUG-CRM-2025",
        "rating": 4.4,
        "starred": true
    }
];

const ProductCarousel = () => {
    return (
        <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-24">
                        Category Best Sellers
                    </h2>
                </div>

                {/* Carousel */}
                <div>
                    <Carousel
                        opts={{
                            align: "center",
                            loop: true,
                        }}
                        className="w-full relative "
                    >
                        <CarouselContent>
                            {carouselProducts.map((product) => (
                                <CarouselItem key={product.productId} className=" md:basis-1/2 lg:basis-1/3 xl:basis-1/5">
                                    <ProductCard product={product} promo={null} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-0 top-[-50] h-10 w-10 border-2 border-gray-300 bg-white hover:bg-gray-50" />
                        <CarouselNext className="right-0 top-[-50]  h-10 w-10 border-2 border-gray-300 bg-white hover:bg-gray-50" />
                  
                    </Carousel>
 
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;
"use client"
import React, { useState } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Grid, List, Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterSidebar from "./FilterSidebar";

// Sample product data
const products = [
    {
        id: 1,
        title: "Shirt Soft Cotton",
        brand: "Uniqlo",
        price: 60.00,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
        badge: "New Arrival",
        stock: "15 items left",
        rating: 4.5,
        isWishlisted: false
    },
    {
        id: 2,
        title: "Zip Up Neck Shirt",
        brand: "Uniqlo",
        price: 60.00,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
        badge: "New Arrival",
        stock: "12 items left",
        rating: 4.3,
        isWishlisted: false
    },
    {
        id: 3,
        title: "Classic Long Sleeve",
        brand: "Uniqlo",
        price: 60.00,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=300&h=300&fit=crop",
        badge: "New Arrival",
        stock: "20 items left",
        rating: 4.7,
        isWishlisted: false
    },
    {
        id: 4,
        title: "Shirt Soft Cotton",
        brand: "Uniqlo",
        price: 60.00,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1622470953794-389648aa5601?w=300&h=300&fit=crop",
        badge: "New Arrival",
        stock: "8 items left",
        rating: 4.2,
        isWishlisted: false
    },
    {
        id: 5,
        title: "Shirt Soft Cotton",
        brand: "Uniqlo",
        price: 60.00,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop",
        badge: "New Arrival",
        stock: "25 items left",
        rating: 4.6,
        isWishlisted: false
    },
    {
        id: 6,
        title: "Classic Long Sleeve",
        brand: "Uniqlo",
        price: 60.00,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1583743814966-8936f37f888b?w=300&h=300&fit=crop",
        badge: "New Arrival",
        stock: "18 items left",
        rating: 4.4,
        isWishlisted: false
    }
];

const ProductCard = ({ product, onWishlistToggle }: { product: any, onWishlistToggle: (id: number) => void }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
            <img
                src={product.image}
                alt={product.title}
                className="w-full h-64 object-cover"
            />
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => onWishlistToggle(product.id)}
            >
                <Heart className={`h-4 w-4 ${product.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            {product.badge && (
                <span className="absolute top-2 left-2 bg-cyan-400 text-white px-2 py-1 rounded text-xs font-medium">
                    {product.badge}
                </span>
            )}
        </div>

        <div className="p-4">
            <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-gray-500">{product.brand}</span>
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                </div>
            </div>

            <h3 className="font-medium text-gray-900 mb-1">{product.title}</h3>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600">SAR {product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">SAR {product.originalPrice.toFixed(2)}</span>
                    )}
                </div>
                <span className="text-xs text-red-500">{product.stock}</span>
            </div>

            <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-white">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
            </Button>
        </div>
    </div>
);

const ProductGrid = () => {
    const [wishlistedItems, setWishlistedItems] = useState(new Set());
    const [viewMode, setViewMode] = useState('grid');

    const handleWishlistToggle = (productId: number) => {
        const newWishlisted = new Set(wishlistedItems);
        if (newWishlisted.has(productId)) {
            newWishlisted.delete(productId);
        } else {
            newWishlisted.add(productId);
        }
        setWishlistedItems(newWishlisted);
    };

    const productsWithWishlist = products.map(product => ({
        ...product,
        isWishlisted: wishlistedItems.has(product.id)
    }));

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
                  
                            {/* <h1 className="text-lg font-medium text-gray-900">64 result for clothes</h1> */}

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1 border rounded p-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-7 w-7 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-7 w-7 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
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
             

                        {/* Products */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Products Cards */}
                        </div>
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
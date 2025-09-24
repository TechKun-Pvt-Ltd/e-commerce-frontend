"use client";

import React, { useCallback, useEffect, useState } from 'react';
import CheckoutForm from './components/CheckoutForm';
import { OrderCreatePayload } from '@/types/domains/order';
import { ProductPreview } from '@/types/domains/product';
import { ShippingMethod } from '@/types/domains/shipping_method';
import * as productServices from '@/services/product';
import * as shippingServices from '@/services/shippingMethod';
import * as orderServices from '@/services/shopOrder';
import useDataFetch from '@/hooks/use-data-fetch';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

// Mock cart items - you can replace this with actual cart state management
const mockCartItems: (ProductPreview & { quantity: number })[] = [
    {
        productId: 1,
        productVariantId: 101,
        categoryId: 1,
        shippingMethodId: 1,
        dateAdded: new Date(),
        quantityInStock: 10,
        imageUrl: "/api/placeholder/60/60",
        price: 55,
        title: "Chicken Kheema Jumbo Lunchbox",
        code: "CKJ001",
        rating: 4.5,
        starred: false,
        quantity: 1
    },
    {
        productId: 2,
        productVariantId: 102,
        categoryId: 1,
        shippingMethodId: 1,
        dateAdded: new Date(),
        quantityInStock: 8,
        imageUrl: "/api/placeholder/60/60",
        price: 75,
        title: "Smoked Butter Chicken Jumbo Lunchbox",
        code: "SBC001",
        rating: 4.7,
        starred: true,
        quantity: 1
    },
    {
        productId: 3,
        productVariantId: 103,
        categoryId: 1,
        shippingMethodId: 1,
        dateAdded: new Date(),
        quantityInStock: 5,
        imageUrl: "/api/placeholder/60/60",
        price: 60,
        title: "Roasted Chicken Steak",
        code: "RCS001",
        rating: 4.3,
        starred: false,
        quantity: 1
    }
];

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<(ProductPreview & { quantity: number })[]>(mockCartItems);
    
    // Data fetching hooks
    const productsData = useDataFetch(productServices.getAllProducts);
    const shippingMethodsData = useDataFetch(shippingServices.getAllShippingMethods);
    const createOrderData = useDataFetch(orderServices.createOrder);

    useEffect(() => {
        // Load products and shipping methods on component mount
        productsData.request({});
        shippingMethodsData.request();
    }, []);

    // Update cart items when products are loaded
    useEffect(() => {
        if (productsData.data && Array.isArray(productsData.data)) {
            const updatedCartItems = cartItems.map(cartItem => {
                const productFromApi = (productsData.data as ProductPreview[]).find(
                    p => p.productVariantId === cartItem.productVariantId
                );
                return productFromApi ? { ...productFromApi, quantity: cartItem.quantity } : cartItem;
            });
            setCartItems(updatedCartItems);
        }
    }, [productsData.data]);

    const handleOrderSubmit = useCallback((orderData: OrderCreatePayload) => {
        createOrderData.request(orderData)
            .onSuccess((response) => {
                toast.success("Order placed successfully!");
                // Redirect to order confirmation or orders page
                router.push(`/orders/${response.orderId}`);
            })
            .onError((error) => {
                toast.error("Failed to place order. Please try again.");
                console.error("Order creation failed:", error);
            });
    }, [createOrderData, router]);

    const updateCartItemQuantity = useCallback((productVariantId: number, newQuantity: number) => {
        if (newQuantity <= 0) return;
        
        setCartItems(prev => 
            prev.map(item => 
                item.productVariantId === productVariantId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    }, []);

    const removeCartItem = useCallback((productVariantId: number) => {
        setCartItems(prev => 
            prev.filter(item => item.productVariantId !== productVariantId)
        );
    }, []);

    // Show loading state while data is being fetched
    if (productsData.isLoading || shippingMethodsData.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    // Show error state if data failed to load


   

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto">
                <CheckoutForm
                    cartItems={cartItems}
                    shippingMethods={shippingMethodsData.data as ShippingMethod[] || []}
                    loading={createOrderData.isLoading}
                    onSubmit={handleOrderSubmit}
                    onQuantityChange={updateCartItemQuantity}
                    onRemoveItem={removeCartItem}
                />
            </div>
        </div>
    );
}
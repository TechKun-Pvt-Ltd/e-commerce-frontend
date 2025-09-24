"use client";

import React, { use, useCallback, useEffect, useState } from 'react';
import CheckoutForm from './components/CheckoutForm';
import { OrderCreatePayload } from '@/types/domains/order';
import { ProductPreview } from '@/types/domains/product';
import { ShippingMethod } from '@/types/domains/shipping_method';
import * as shippingServices from '@/services/shippingMethod';
import * as orderServices from '@/services/shopOrder';
import useDataFetch from '@/hooks/use-data-fetch';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

// Mock cart items
const mockCartItems: (ProductPreview & { quantity: number })[] = [
    { productId: 1, productVariantId: 101, categoryId: 1, shippingMethodId: 1, dateAdded: new Date(), quantityInStock: 10, imageUrl: "/api/placeholder/60/60", price: 55, title: "Chicken Kheema Jumbo Lunchbox", code: "CKJ001", rating: 4.5, starred: false, quantity: 1 },
    { productId: 2, productVariantId: 102, categoryId: 1, shippingMethodId: 1, dateAdded: new Date(), quantityInStock: 8, imageUrl: "/api/placeholder/60/60", price: 75, title: "Smoked Butter Chicken Jumbo Lunchbox", code: "SBC001", rating: 4.7, starred: true, quantity: 1 },
    { productId: 3, productVariantId: 103, categoryId: 1, shippingMethodId: 1, dateAdded: new Date(), quantityInStock: 5, imageUrl: "/api/placeholder/60/60", price: 60, title: "Roasted Chicken Steak", code: "RCS001", rating: 4.3, starred: false, quantity: 1 }
];

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<(ProductPreview & { quantity: number })[]>(mockCartItems);
    
    // const orderShippingMethodByProductVariantId = useDataFetch(shippingServices.orderShippingMethodByProductVariantId);
    const shipping = useDataFetch(shippingServices.getAllShippingMethods);
const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const createOrderData = useDataFetch(orderServices.createOrder);
    useEffect(() => {
        shipping.request()
        // const result = cartItems.forEach(item => {
        //     orderShippingMethodByProductVariantId.request(item.productVariantId);
        // });
        // setShippingMethods(result as any)
    }, []);
   

    const handleOrderSubmit = useCallback((orderData: OrderCreatePayload) => {
        createOrderData.request(orderData)
            .onSuccess((response) => {
                toast.success("Order placed successfully!");
                router.push(`/orders/${response.orderId}`);
            })
            .onError((error) => {
                toast.error("Failed to place order. Please try again.");
                console.error("Order creation failed:", error);
            });
    }, [createOrderData, router]);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto">
                <CheckoutForm
                    cartItems={cartItems}
                    shippingMethods={shipping.data as ShippingMethod[] || []}
                    loading={createOrderData.isLoading}
                    onSubmit={handleOrderSubmit}
                />
            </div>
        </div>
    );
}

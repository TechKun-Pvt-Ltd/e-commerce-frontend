"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import CheckoutForm from "./components/CheckoutForm";
import { OrderCreatePayload } from "@/types/domains/order";
import { ProductPreview } from "@/types/domains/product";
import { ShippingMethod } from "@/types/domains/shipping_method";
import * as shippingServices from "@/services/shippingMethod";
import * as orderServices from "@/services/shopOrder";
import useDataFetch from "@/hooks/use-data-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function CheckoutPage() {
    const router = useRouter();
    const { items: cartItems, totalAmount, totalItems } = useAppSelector((state) => state.cart);
    const createOrderData = useDataFetch(orderServices.createOrder);
    const getShippingMethodByVariant = useDataFetch(shippingServices.getShippingMethodByVariantId);
    const [shippingMethods, setShippingMethods] = useState<Record<number, ShippingMethod>>({});

    useEffect(() => {
        const fetchShippingMethods = async () => {
            for (const item of cartItems) {
                try {
                    getShippingMethodByVariant.request(item.productVariantId).onSuccess((shippingMethod) => {
                        console.log("Shipping method for variant", item.productVariantId, shippingMethod);
                        setShippingMethods((prev) => ({
                            ...prev,
                            [item.cartItemId]: shippingMethod,
                        }));
                    });
                } catch (error) {
                    console.error(`Failed to fetch shipping method for variant ${item.productVariantId}:`, error);
                }
            }
        };

        if (cartItems.length > 0) {
            fetchShippingMethods();
        }
    }, [cartItems]);

    const handleOrderSubmit = useCallback(
        (orderData: OrderCreatePayload) => {
            createOrderData
                .request(orderData)
                .onSuccess((response) => {
                    toast.success("Order placed successfully!");
                    router.push(`/orders/${response.orderId}`);
                })
                .onError((error) => {
                    toast.error("Failed to place order. Please try again.");
                    console.error("Order creation failed:", error);
                });
        },
        [createOrderData, router]
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto">
                <CheckoutForm
                    cartItems={cartItems}
                    totalAmount={totalAmount}
                    shippingMethods={shippingMethods}
                    loading={createOrderData.isLoading}
                    onSubmit={handleOrderSubmit}
                />
            </div>
        </div>
    );
}
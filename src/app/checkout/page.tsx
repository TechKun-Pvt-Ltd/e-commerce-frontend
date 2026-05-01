/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";

import useDataFetch from "@/hooks/use-data-fetch";
import * as iyzicoServices from "@/services/iyzico";
import * as shippingServices from "@/services/shippingMethod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { PaymentInitiateRequest, PaymentInitiateResponse } from "@/services/iyzico";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { toast } from "sonner";
import CheckoutForm from "./components/CheckoutForm";
import ThreeDSModal from "./components/ThreeDSModal";
import { clearBuyNowItem } from "@/store/slices/buyNowSlice";

const shippingMethodsMap: Record<number, ShippingMethod> = {};

function CheckoutPageInner() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get("mode") === "buynow";
    const paymentResult = searchParams.get("payment");

    const { items: cartItems, totalAmount } = useAppSelector((state) => state.cart);
    const buyNowItem = useAppSelector((state) => state.buyNow.item);
    const { user } = useAppSelector((state) => state.auth);

    const [threeDSHtml, setThreeDSHtml] = useState<string | null>(null);

    // Show toast if redirected back from iyzico callback with a failure
    useEffect(() => {
        if (paymentResult === "failed") {
            const reason = searchParams.get("reason");
            const messages: Record<string, string> = {
                "3ds_failed": "Payment was declined by your bank. Please try again.",
                "confirmation_failed": "Payment could not be confirmed. Please try again.",
                "server_error": "A server error occurred. Please try again.",
            };
            toast.error(messages[reason ?? ""] ?? "Payment failed. Please try again.");
        }
    }, []);

    useEffect(() => {
        if (!isBuyNow) dispatch(clearBuyNowItem());
    }, []);

    const effectiveItems = useMemo(
        () => (isBuyNow && buyNowItem ? [buyNowItem] : cartItems),
        [isBuyNow, buyNowItem, cartItems]
    );
    const effectiveTotal = useMemo(
        () => (isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalAmount),
        [isBuyNow, buyNowItem, totalAmount]
    );

    const initiatePaymentData = useDataFetch(iyzicoServices.initiatePayment);
    const getShippingMethodByVariant = useDataFetch(shippingServices.getShippingMethodByVariantId);

    useEffect(() => {
        if (effectiveItems.length === 0) return;
        for (const item of effectiveItems) {
            getShippingMethodByVariant.request(item.productVariantId).onSuccess((shippingMethod) => {
                shippingMethodsMap[item.cartItemId] = shippingMethod;
            });
        }
    }, [effectiveItems]);

    const handlePaymentSubmit = useCallback(
        (payload: PaymentInitiateRequest) => {
            initiatePaymentData
                .request(payload)
                .onSuccess((response: PaymentInitiateResponse) => {
                    if (response.htmlContent) {
                        // Show the 3DS iframe modal
                        setThreeDSHtml(response.htmlContent);
                    } else {
                        toast.error("Could not initiate payment. Please try again.");
                    }
                })
                .onError((error: string) => {
                    toast.error("Payment initiation failed. Please check your card details and try again.");
                    console.error("Payment initiation error:", error);
                });
        },
        [initiatePaymentData]
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto">
                <CheckoutForm
                    cartItems={effectiveItems}
                    subtotalAmount={effectiveTotal}
                    shippingMethods={shippingMethodsMap}
                    loading={initiatePaymentData.isLoading}
                    onSubmit={handlePaymentSubmit}
                    currentAddress={user?.address}
                />
            </div>

            {/* 3DS iframe modal — shown after iyzico returns HTML */}
            {threeDSHtml && (
                <ThreeDSModal
                    htmlContent={threeDSHtml}
                    onClose={() => {
                        setThreeDSHtml(null);
                        toast.info("Payment cancelled.");
                    }}
                />
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
            </div>
        }>
            <CheckoutPageInner />
        </Suspense>
    );
}

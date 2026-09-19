"use client";

import React, { Suspense } from "react";
import { use } from "react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as orderServices from "@/services/shopOrder";
import { OrderDetails } from "@/types/domains/order";
import OrderDetailView from "../components/OrderDetails";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

const OrderDetailsContent = ({ orderId }: { orderId: string }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const isSuccess = searchParams.get("payment") === "success";
    const trackingParam = searchParams.get("trackingNumber");

    const getOrderFetch = useDataFetch(orderServices.getOrderById);
    const getOrderTrackFetch = useDataFetch(orderServices.getOrderByTrackingNumber);
    const [order, setOrder] = useState<OrderDetails | null>(null);

    // Clear cart if arriving after successful payment
    useEffect(() => {
        if (isSuccess) {
            dispatch(clearCart());
        }
    }, [isSuccess, dispatch]);

    useEffect(() => {
        if (!orderId) return;

        // If orderId is a tracking number format (starts with KVG-) or trackingParam is present
        if (orderId.startsWith("KVG-")) {
            getOrderTrackFetch.request(orderId).onSuccess((data: OrderDetails) => {
                setOrder(data);
            });
            return;
        }

        const numericId = Number(orderId);
        if (!isNaN(numericId)) {
            getOrderFetch.request(numericId)
                .onSuccess((data: OrderDetails) => {
                    setOrder(data);
                })
                .onError(() => {
                    // Fallback to tracking query param if authenticated fetch failed (guest checkout)
                    if (trackingParam) {
                        getOrderTrackFetch.request(trackingParam).onSuccess((data: OrderDetails) => {
                            setOrder(data);
                        });
                    }
                });
        } else if (trackingParam) {
            getOrderTrackFetch.request(trackingParam).onSuccess((data: OrderDetails) => {
                setOrder(data);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, trackingParam]);

    const copyTrackingNumber = (trackingNum: string) => {
        navigator.clipboard.writeText(trackingNum);
        toast.success("Tracking number copied to clipboard!");
    };

    const isLoading = getOrderFetch.isLoading || getOrderTrackFetch.isLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">We could not find order #{orderId}. If you ordered as a guest, you can track your order with your tracking number.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => router.push("/orders/track")}>Track by Number</Button>
                        <Button onClick={() => router.push("/")}>Return to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {isSuccess && (
                <div className="bg-emerald-50 border-b border-emerald-200 py-4 px-4">
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-800">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-base">Payment Successful! Your order has been placed.</p>
                                <p className="text-xs text-emerald-700">A confirmation email has been sent with your order details.</p>
                            </div>
                        </div>
                        {order.trackingNumber && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300">
                                <span className="text-xs font-medium text-gray-600">Tracking #:</span>
                                <span className="font-mono font-bold text-sm text-gray-900">{order.trackingNumber}</span>
                                <button
                                    onClick={() => copyTrackingNumber(order.trackingNumber)}
                                    className="p-1 hover:text-emerald-700 transition-colors"
                                    title="Copy tracking number"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <OrderDetailView order={order} />
        </div>
    );
};

const OrderDetailsPage = ({ params }: { params: Promise<{ orderId: string }> }) => {
    const { orderId } = use(params);
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
        }>
            <OrderDetailsContent orderId={orderId} />
        </Suspense>
    );
};

export default OrderDetailsPage;

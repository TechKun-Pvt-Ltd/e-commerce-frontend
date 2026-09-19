"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useDataFetch from "@/hooks/use-data-fetch";
import * as orderServices from "@/services/shopOrder";
import { OrderDetails } from "@/types/domains/order";
import OrderDetailView from "../components/OrderDetails";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/spinner";

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const initialTracking = searchParams.get("trackingNumber") || "";

    const [trackingNumber, setTrackingNumber] = useState(initialTracking);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [notFound, setNotFound] = useState(false);

    const trackFetch = useDataFetch(orderServices.getOrderByTrackingNumber);

    const handleSearch = (trackNumToSearch?: string) => {
        const query = (trackNumToSearch ?? trackingNumber).trim().toUpperCase();
        if (!query) return;

        setNotFound(false);
        setOrder(null);

        trackFetch.request(query)
            .onSuccess((data: OrderDetails) => {
                setOrder(data);
                setNotFound(false);
            })
            .onError(() => {
                setNotFound(true);
                setOrder(null);
            });
    };

    useEffect(() => {
        if (initialTracking) {
            handleSearch(initialTracking);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTracking]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Search Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Track Your Order</CardTitle>
                        <CardDescription className="text-gray-500">
                            Enter the tracking number from your order confirmation email (e.g. KVG-260919-A8B9C2)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="e.g. KVG-260919-A8B9C2"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                                    className="pl-9 font-mono uppercase tracking-wider"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={trackFetch.isLoading || !trackingNumber.trim()}
                                className="bg-black hover:bg-gray-800 text-white font-semibold px-6"
                            >
                                {trackFetch.isLoading ? <Spinner className="mr-2" /> : null}
                                Track Order
                            </Button>
                        </form>

                        {notFound && (
                            <div className="mt-6 max-w-xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800 text-sm">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Order not found</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        We couldn&apos;t find an order matching &ldquo;{trackingNumber}&rdquo;. Please check the number in your confirmation email or contact support.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Result */}
                {order && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <OrderDetailView order={order} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
            </div>
        }>
            <TrackOrderContent />
        </Suspense>
    );
}

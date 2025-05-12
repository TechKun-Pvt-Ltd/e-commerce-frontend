"use client";
import { useEffect } from "react";
import OrderList from "@/app/orders/components/OrderList";
import useDataFetch from "@/hooks/use-data-fetch";
import { getAllOrders } from "@/services/shopOrder";

export default function OrderHistory() {
  const orders = useDataFetch(getAllOrders);

  useEffect(() => {
    orders.request();
  }, [orders]);

  if (orders.isLoading) {
    return <div className="text-center text-blue-500 text-2xl p-10">Loading...</div>;
  }

  if (orders.hasError || !orders.response?.length) {
    return <div className="text-center text-red-500 text-2xl p-10">{"No data."}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <OrderList orders={orders.response} />
        </div>
      </div>
    </div>
  );
}
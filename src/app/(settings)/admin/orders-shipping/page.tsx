"use client"
import React from 'react'
import * as orderServices from "@/services/shopOrder";
import useDataFetch from '@/hooks/use-data-fetch';
import { OrderPreviewDTO } from '@/types/domains/order';
import OrdersTable from './components/OrdersTable';

export default function page() {
    const ordersData = useDataFetch(orderServices.getAllOrders);
    console.log('Orders Data:', ordersData);
    const handleEditOrder = (order: OrderPreviewDTO) => {
        console.log('Edit order:', order);               
    }                                                     

    const handleDeleteOrder = (orderId: number) => {
        console.log('Delete order:', orderId);      
    };                                               

    const handleViewOrderDetails = (orderId: number) => {
        console.log('View order details:', orderId);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Order & Shipping</h1>
            </div>

            <OrdersTable
                ordersData={ordersData.data || []}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onViewDetails={handleViewOrderDetails}
            />
        </div>
    )
}
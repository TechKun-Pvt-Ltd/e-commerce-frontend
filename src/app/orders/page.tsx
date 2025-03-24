"use client";
import React from 'react';
import OrderList from './components/OrderList';

const OrdersPage = () => {
    // Mock data for orders - in a real app, this would come from an API
    const orders = [
        {
            id: '1',
            orderNumber: 'ORD-2023-001',
            date: '2023-12-01',
            total: 120.98,
            status: 'Delivered',
            items: [
                { name: 'Canvas Print', quantity: 2, price: 49.99 },
                { name: 'Frame', quantity: 1, price: 19.99 }
            ]
        },
        {
            id: '2',
            orderNumber: 'ORD-2023-002',
            date: '2023-12-05',
            total: 89.99,
            status: 'Processing',
            items: [
                { name: 'Wall Art', quantity: 1, price: 89.99 }
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <OrderList orders={orders} />
        </div>
    );
};

export default OrdersPage;
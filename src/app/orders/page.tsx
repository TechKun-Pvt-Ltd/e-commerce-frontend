"use client";
import React from 'react';
import OrderList from './components/OrderList';

const OrdersPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <OrderList/>
        </div>
    );
};

export default OrdersPage;
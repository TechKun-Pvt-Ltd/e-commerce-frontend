"use client";
import React, { useEffect } from 'react';
import OrderList from './components/OrderList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders } from '@/store/slices/ordersSlice';

const OrdersPage = () => {
    const dispatch = useAppDispatch();
    const { items: orders, loading, error } = useAppSelector(state => state.orders);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    if (loading) {
        return <div className="text-center text-blue-500 text-2xl p-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 text-2xl p-10">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <OrderList orders={orders} />
        </div>
    );
};

export default OrdersPage;
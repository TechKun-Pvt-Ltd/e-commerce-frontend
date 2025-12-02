"use client"
import { ShopOrder } from '@/types/domains/order';
import React from 'react';

interface OrderListProps {
    orders: ShopOrder[];
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered':
            return 'bg-green-100 text-green-700';
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        case 'pending':
            return 'bg-blue-100 text-blue-700';
        case 'processing':
            return 'bg-amber-100 text-amber-700';
        case 'shipped':
            return 'bg-purple-100 text-purple-700';
        case 'out_for_delivery':
            return 'bg-orange-100 text-orange-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl font-medium text-gray-900 mb-2">No orders found</h2>
                <p className="text-gray-500">Start shopping to create your first order</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-xl shadow-sm p-5 mb-6 transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <p className="text-sm text-gray-500">Order ID</p>
                            <p className="text-xl font-bold">#{order.orderId}</p>
                        </div>
                        <div className={`self-start sm:self-center ${getStatusColor(order.status)} px-4 py-1.5 rounded-full text-sm font-medium`}>
                            {order.status}
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {order.orderItems.map(item => (
                            <div key={item.orderItemId} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <p className="text-gray-700">{item.productVariantId}</p>
                                    <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                                </div>
                                <p className="font-medium">Rs. {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold">
                            <p>Total</p>
                            {/* <p>Rs. {order.orderTotal.toLocaleString('id-ID')}</p> */}
                            <p>Rs. 100</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <p className="font-bold text-lg"></p>
                            <a
                                href={`/orders/${order.orderId}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View Details →
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderList;
"use client";
import React from 'react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    status: string;
    items: OrderItem[];
}

interface OrderListProps {
    orders: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                Order #{order.orderNumber}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.quantity}x {item.name}
                                    </span>
                                    <span className="text-gray-900">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-900">
                            Total
                            <span className="ml-2">${order.total.toFixed(2)}</span>
                        </div>
                        <a
                            href={`/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            View Details →
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderList;
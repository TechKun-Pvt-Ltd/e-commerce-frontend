"use client";
import React from 'react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface TimelineEvent {
    status: string;
    date: string;
}

interface OrderDetailsProps {
    order: {
        id: string;
        orderNumber: string;
        date: string;
        total: number;
        status: string;
        items: OrderItem[];
        shippingAddress: {
            firstName: string;
            lastName: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            email: string;
            phone: string;
        };
        paymentDetails: {
            cardNumber: string;
            cardHolder: string;
            expiryDate: string;
        };
        timeline: TimelineEvent[];
    };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.orderNumber}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                    </div>
                    <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'}`}
                    >
                        {order.status}
                    </span>
                </div>

                {/* Order Timeline */}
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
                    <div className="space-y-4">
                        {order.timeline.map((event, index) => (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{event.status}</p>
                                    <p className="text-sm text-gray-500">{event.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                    <div className="space-y-3">
                        <p className="text-gray-800">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p className="text-gray-800">{order.shippingAddress.address}</p>
                        <p className="text-gray-800">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-gray-800">{order.shippingAddress.country}</p>
                        <div className="pt-3 border-t border-gray-200 mt-3">
                            <p className="text-gray-800">Email: {order.shippingAddress.email}</p>
                            <p className="text-gray-800">Phone: {order.shippingAddress.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                    <div className="space-y-3">
                        <p className="text-gray-800">
                            Card ending in {order.paymentDetails.cardNumber.slice(-4)}
                        </p>
                        <p className="text-gray-800">{order.paymentDetails.cardHolder}</p>
                        <p className="text-gray-800">Expires: {order.paymentDetails.expiryDate}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                        >
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium">{item.name}</p>
                                <p className="text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="text-gray-900 font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="text-lg font-medium text-gray-900">Total</span>
                        <span className="text-lg font-medium text-gray-900">
                            ${order.total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
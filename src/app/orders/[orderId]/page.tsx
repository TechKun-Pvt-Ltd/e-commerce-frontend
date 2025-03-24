"use client";
import React from 'react';
import OrderDetails from '../components/OrderDetails';

const OrderDetailsPage = ({ params }: { params: { orderId: string } }) => {
    // Mock data for order details - in a real app, this would come from an API
    const order = {
        id: params.orderId,
        orderNumber: 'ORD-2023-001',
        date: '2023-12-01',
        total: 120.98,
        status: 'Delivered',
        items: [
            { name: 'Canvas Print', quantity: 2, price: 49.99 },
            { name: 'Frame', quantity: 1, price: 19.99 }
        ],
        shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            email: 'john@example.com',
            phone: '(555) 123-4567'
        },
        paymentDetails: {
            cardNumber: '****-****-****-1234',
            cardHolder: 'John Doe',
            expiryDate: '12/25'
        },
        timeline: [
            { status: 'Order Placed', date: '2023-12-01 10:00 AM' },
            { status: 'Payment Confirmed', date: '2023-12-01 10:05 AM' },
            { status: 'Processing', date: '2023-12-02 09:00 AM' },
            { status: 'Shipped', date: '2023-12-03 02:30 PM' },
            { status: 'Delivered', date: '2023-12-05 11:45 AM' }
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
                <a
                    href="/orders"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to Orders
                </a>
            </div>
            <OrderDetails order={order} />
        </div>
    );
};

export default OrderDetailsPage;
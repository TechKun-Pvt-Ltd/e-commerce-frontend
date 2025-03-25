"use client"
import React from 'react';
import { OrderItem, OrderDetail } from '@/app/types/models';


// Mock data based on the image
const mockOrderDetail: OrderDetail = {
    id: "8981786",
    status: "On Deliver",
    timeline: [
        {
            date: "4 Jul (Now)",
            time: "06:00",
            status: "Your package is packed by the courier",
            location: "Malang, East Java, Indonesia"
        },
        {
            date: "2 Jul",
            time: "06:00",
            status: "Shipment has been created",
            location: "Malang, Indonesia"
        },
        {
            date: "1 Jul",
            time: "06:00",
            status: "Order placed",
            location: ""
        }
    ],
    shipping: {
        origin: "Malang, Indonesia",
        destination: "Emir's House, Indonesia",
        courier: "Doordash Indonesia",
        courierDetail: "Surabaya, Lorkldul, East Java, Indonesia"
    },
    delivery: {
        estimatedArrival: "9 July 2024",
        deliveredIn: "5 Days"
    },
    recipient: {
        name: "Emir",
        address: "Malang, East Java, Indonesia"
    },
    tracking: "871291892812",
    items: [
        {
            orderItemId: 1,
            productVariant: {
                productVariantId: 1,
                name: "Nike Air Max SYSTM",
                sizeOption: {
                    sizeOptionId: 1,
                    value: "24"
                },
                frameOption: {
                    frameOptionId: 1,
                    value: ""
                },
                price: 1459000,
            },
            image: {
                productImageId: 1,
                imageUrl: "/nike-air-max-systm.jpg"
            },
            quantity: 1
        },
        {
            orderItemId: 2,
            productVariant: {
                productVariantId: 1,
                name: "Nike Air Max Pulse",
                sizeOption: {
                    sizeOptionId: 1,
                    value: "24"
                },
                frameOption: {
                    frameOptionId: 1,
                    value: ""
                },
                price: 2379000,
            },
            image: {
                productImageId: 1,
                imageUrl: "/nike-air-max-pulse.jpg"
            },
            quantity: 1
        },
        {
            orderItemId: 3,
            productVariant: {
                productVariantId: 1,
                name: "Nike Air Rift",
                sizeOption: {
                    sizeOptionId: 1,
                    value: "24"
                },
                frameOption: {
                    frameOptionId: 1,
                    value: ""
                },
                price: 1909000,
            },
            image: {
                productImageId: 1,
                imageUrl: "/nike-air-rift.jpg"
            },
            quantity: 1
        },
        {
            orderItemId: 4,
            productVariant: {
                productVariantId: 1,
                name: "Nike Air Max Air",
                sizeOption: {
                    sizeOptionId: 1,
                    value: "24"
                },
                frameOption: {
                    frameOptionId: 1,
                    value: ""
                },
                price: 2379000,
            },
            image: {
                productImageId: 1,
                imageUrl: "/nike-air-max-air.jpg"
            },
            quantity: 1
        }
    ],
    payment: {
        status: "Payment Success",
        total: 7890000
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'on deliver':
            return 'bg-amber-100 text-amber-700';
        case 'delivered':
            return 'bg-green-100 text-green-700';
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        case 'pending':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const order = mockOrderDetail; // Would normally come from API

const OrderList: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Order ID and Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="text-xl font-bold">#{order.id}</p>
                    </div>
                    <div className={`self-start sm:self-center ${getStatusColor(order.status)} px-4 py-1.5 rounded-full text-sm font-medium`}>
                        {order.status}
                    </div>
                </div>
            </div>
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm mb-6 transition-all hover:shadow-md overflow-hidden">
                <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold">Order Summary</h3>
                        <div className="text-green-500 text-sm font-medium rounded-full bg-green-50 px-3 py-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 6 9 17l-5-5" /></svg>
                            {order.payment.status}
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">Here's your summary for the stuff you bought.</p>

                    {/* Item list with prices aligned to right */}
                    <div className="space-y-3 mb-4">
                        {order.items.map(item => (
                            <div key={item.orderItemId} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <p className="text-gray-700">{item.productVariant.name}</p>
                                    <span className="text-gray-400 text-sm ml-2">x{item.quantity || 1}</span>
                                </div>
                                <p className="font-medium">Rp{item.productVariant.price}</p>
                            </div>
                        ))}

                        {/* Total row with bolder styling */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold">
                            <p>Total</p>
                            <p>Rp{order.payment.total.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <p className="font-bold text-lg"></p>
                            <a
                                href={`/orders/${order.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View Details →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderList;
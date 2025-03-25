"use client"
import React from 'react';
import Image from 'next/image';
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
            id: 1,
            name: "Nike Air Max SYSTM",
            price: 1459000,
            image: "/nike-air-max-systm.jpg",
            size: "24",
            quantity: 1
        },
        {
            id: 2,
            name: "Nike Air Max Pulse",
            price: 2379000,
            image: "/nike-air-max-pulse.jpg",
            size: "24",
            quantity: 1
        },
        {
            id: 3,
            name: "Nike Air Rift",
            price: 1909000,
            image: "/nike-air-rift.jpg",
            size: "24",
            quantity: 1
        },
        {
            id: 4,
            name: "Nike Air Max Air",
            price: 2379000,
            image: "/nike-air-max-air.jpg",
            size: "24",
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

const OrderDetails: React.FC = () => {
    const order = mockOrderDetail; // Would normally come from API
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Back button + Order ID header */}
                <div className="flex items-center mb-6">
                    <button
                        // onClick={() => router.back()} 
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold flex-grow">Order Detail</h1>
                    <button className="bg-white shadow rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18h-1a2 2 0 0 1-2-2V9" /></svg>
                    </button>
                </div>

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

                {/* Shipping Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Shipping Progress */}
                    <div className="bg-white rounded-xl shadow-sm p-5 transition-all hover:shadow-md h-full">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="4" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M8 12h.01" /><path d="M16 12h.01" /></svg>
                            </div>
                            <div className="ml-3">
                                <p className="font-medium">Be patient, package on deliver!</p>
                            </div>
                        </div>

                        <div className="flex items-center text-sm mb-4">
                            <div className="px-3 py-1.5 bg-gray-100 rounded-md text-xs">{order.shipping.origin}</div>
                            <div className="border-t-2 border-dashed border-gray-300 flex-grow mx-2"></div>
                            <div className="px-3 py-1.5 bg-gray-100 rounded-md text-xs">{order.shipping.destination}</div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
                        </div>
                    </div>

                    {/* Estimated Arrival */}
                    <div className="bg-white rounded-xl shadow-sm p-5 transition-all hover:shadow-md h-full">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7.8C5.6 7.3 6.3 7 7 7h10c.7 0 1.4.3 2 .8" /><path d="m5 7.8.5-1.6a2 2 0 0 1 2-1.4h9a2 2 0 0 1 2 1.4l.5 1.6" /><path d="M9 17h6" /><path d="M8 7h8" /><rect width="16" height="16" x="4" y="8" rx="2" /></svg>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Estimated Arrival</p>
                        <p className="font-bold text-lg">{order.delivery.estimatedArrival}</p>
                        <div className="mt-3 bg-blue-50 rounded-lg p-2 text-blue-800 text-xs inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                            Delivery on schedule
                        </div>
                    </div>

                    {/* Delivered In */}
                    <div className="bg-white rounded-xl shadow-sm p-5 transition-all hover:shadow-md h-full">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Delivered in</p>
                        <p className="font-bold text-lg">{order.delivery.deliveredIn}</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6 transition-all hover:shadow-md">
                    <h3 className="text-lg font-medium mb-6">Timeline</h3>
                    <div className="space-y-8">
                        {order.timeline.map((event, index) => (
                            <div key={index} className="flex">
                                <div className="mr-4 text-right flex-none w-20">
                                    <p className="font-medium">{event.date}</p>
                                    <p className="text-gray-500 text-sm">{event.time}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center
                            ${index === 0 ? 'bg-orange-500 text-white' : 'bg-gray-200'}
                          `}>
                                        {index === 0 && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        )}
                                    </div>
                                    {index !== order.timeline.length - 1 && <div className="w-0.5 bg-gray-200 h-20"></div>}
                                </div>
                                <div className="ml-4">
                                    <p className={`font-medium ${index === 0 ? 'text-orange-500' : ''}`}>{event.status}</p>
                                    {event.location && <p className="text-gray-500 text-sm">{event.location}</p>}
                                    {index === 2 && (
                                        <div className="flex items-center mt-2 bg-gray-50 py-1.5 px-3 rounded-lg">
                                            <div className="w-6 h-6 mr-2 overflow-hidden rounded-md">
                                                <Image src="/nike-logo.png" alt="Nike" width={24} height={24} className="rounded" />
                                            </div>
                                            <span className="font-medium">Nike</span>
                                            <svg className="w-4 h-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipment Information */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6 transition-all hover:shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Shipment</h3>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-red-100 rounded-lg mr-3 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>
                                </div>
                                <div>
                                    <p className="font-medium">{order.shipping.courier}</p>
                                    <p className="text-gray-500 text-sm">{order.shipping.courierDetail}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h3 className="text-gray-500 text-sm mb-1">Recipient</h3>
                                <p className="font-medium">{order.recipient.name}</p>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h3 className="text-gray-500 text-sm mb-1">Delivery address</h3>
                                <p className="font-medium">{order.recipient.address}</p>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h3 className="text-gray-500 text-sm mb-1">Tracking No.</h3>
                                <div className="flex items-center">
                                    <p className="font-medium">{order.tracking}</p>
                                    <button className="ml-2 hover:bg-gray-200 p-1 rounded-md transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <h3 className="text-xl font-bold">Items</h3>
                        <span className="ml-2 bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">{order.items.length}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.items.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex hover:shadow-md transition-all">
                                <div className="flex-none w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-4 flex-grow">
                                    <p className="font-medium text-lg mb-1">{item.name}</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-gray-500 text-sm">Size: {item.size}</p>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity || 1}</p>
                                        </div>
                                        <p className="text-gray-900 font-bold">Rp{item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <p className="text-gray-700">{item.name}</p>
                                        <span className="text-gray-400 text-sm ml-2">x{item.quantity || 1}</span>
                                    </div>
                                    <p className="font-medium">Rp{item.price.toLocaleString()}</p>
                                </div>
                            ))}

                            {/* Total row with bolder styling */}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold">
                                <p>Total</p>
                                <p>Rp{order.payment.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom section with total and buttons */}
                    <div className="bg-gray-50 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="font-bold text-lg">Rp{order.payment.total.toLocaleString()}</p>
                            <p className="text-gray-500 text-sm">({order.items.length} items)</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button className="bg-white border border-gray-300 text-gray-800 rounded-full px-6 py-2.5 font-medium hover:bg-gray-100 transition-colors">
                                Contact Seller
                            </button>
                            <button className="bg-black text-white rounded-full px-8 py-2.5 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                                Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
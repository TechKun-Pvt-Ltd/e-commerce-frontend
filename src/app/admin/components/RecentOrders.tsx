"use client";
import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const orders = [
    {
        id: 'ORD001',
        customer: 'John Doe',
        product: 'Wireless Headphones',
        amount: '$99.99',
        status: 'completed',
        date: '2024-02-20'
    },
    {
        id: 'ORD002',
        customer: 'Jane Smith',
        product: 'Smart Watch',
        amount: '$199.99',
        status: 'pending',
        date: '2024-02-19'
    },
    {
        id: 'ORD003',
        customer: 'Mike Johnson',
        product: 'Laptop Backpack',
        amount: '$49.99',
        status: 'cancelled',
        date: '2024-02-18'
    },
    {
        id: 'ORD004',
        customer: 'Sarah Wilson',
        product: 'Bluetooth Speaker',
        amount: '$79.99',
        status: 'completed',
        date: '2024-02-17'
    },
    {
        id: 'ORD005',
        customer: 'Tom Brown',
        product: 'Wireless Mouse',
        amount: '$29.99',
        status: 'pending',
        date: '2024-02-16'
    }
];

const RecentOrders: React.FC = () => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-500 bg-green-50';
            case 'pending':
                return 'text-yellow-500 bg-yellow-50';
            case 'cancelled':
                return 'text-red-500 bg-red-50';
            default:
                return 'text-gray-500 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <FaCheckCircle className="w-4 h-4" />;
            case 'pending':
                return <FaClock className="w-4 h-4" />;
            case 'cancelled':
                return <FaTimesCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.id}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {order.customer}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {order.product}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.amount}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {order.date}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrders; 
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
    FaSearch, 
    FaFilter, 
    FaEllipsisV, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt 
} from 'react-icons/fa';

const CustomersPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data - replace with actual data from your API
    const customers = [
        {
            id: 'CUST001',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 8900',
            location: 'New York, USA',
            orders: 12,
            totalSpent: '$1,299.99',
            status: 'active'
        },
        {
            id: 'CUST002',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1 234 567 8901',
            location: 'Los Angeles, USA',
            orders: 8,
            totalSpent: '$899.99',
            status: 'active'
        },
        // Add more mock customers as needed
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8">
                    <Header title="Customers" />

                    {/* Search and Filter */}
                    <div className="mt-6 flex gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <FaFilter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>

                    {/* Customers Table */}
                    <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-lg font-semibold text-gray-600">
                                                            {customer.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {customer.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.email}</div>
                                            <div className="text-sm text-gray-500">{customer.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                                                {customer.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {customer.orders}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {customer.totalSpent}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <FaEllipsisV className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomersPage; 
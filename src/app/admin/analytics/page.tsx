"use client";
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { IoIosTrendingUp } from "react-icons/io";
import {  
    FaDollarSign, 
    FaShoppingCart, 
    FaUsers, 
    FaCalendarAlt, 
    FaDownload 
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

    // Mock data for stats
    const stats = [
        {
            title: 'Total Revenue',
            value: '$24,500',
            change: '+12.5%',
            trend: 'up',
            icon: FaDollarSign
        },
        {
            title: 'Total Orders',
            value: '1,234',
            change: '+8.2%',
            trend: 'up',
            icon: FaShoppingCart
        },
        {
            title: 'New Customers',
            value: '456',
            change: '+5.7%',
            trend: 'up',
            icon: FaUsers
        },
        {
            title: 'Average Order Value',
            value: '$198.50',
            change: '+3.2%',
            trend: 'up',
            icon: IoIosTrendingUp
        }
    ];

    // Revenue Chart Data
    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: [3000, 5000, 4000, 6000, 5500, 6500],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Orders Chart Data
    const ordersData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Orders',
                data: [150, 200, 180, 250, 220, 280],
                backgroundColor: 'rgb(59, 130, 246)',
            },
        ],
    };

    // Customer Demographics Data
    const demographicsData = {
        labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
        datasets: [
            {
                data: [15, 30, 25, 20, 10],
                backgroundColor: [
                    '#3B82F6',
                    '#60A5FA',
                    '#93C5FD',
                    '#BFDBFE',
                    '#DBEAFE',
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8">
                    <div className="flex justify-between items-center">
                        <Header title="Analytics Dashboard" />
                        <div className="flex items-center gap-4">
                            <select
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <FaDownload className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-full">
                                        <stat.icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <span className={`text-sm font-medium ${
                                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                            <div className="h-64">
                                <Line data={revenueData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Orders Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Overview</h3>
                            <div className="h-64">
                                <Bar data={ordersData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <div key={item} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">Product {item}</p>
                                                <p className="text-sm text-gray-500">Category</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">${(Math.random() * 1000).toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">{Math.floor(Math.random() * 100)} orders</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Demographics */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Demographics</h3>
                            <div className="h-64">
                                <Doughnut 
                                    data={demographicsData} 
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                position: 'right' as const,
                                            },
                                        },
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage; 
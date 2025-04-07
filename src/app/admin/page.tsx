"use client";
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import RecentOrders from './components/RecentOrders';
import { 
    FaPlus, 
    FaUserPlus, 
    FaChartBar, 
    FaCog 
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-4 md:p-6 lg:p-8">
                    <Header title="Dashboard" />
                    
                    {/* Stats Grid */}
                    <div className="mt-6">
                        <StatsGrid />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Orders</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                                    View All
                                </button>
                            </div>
                            <RecentOrders />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button className="flex flex-col items-center justify-center p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                                        <FaPlus className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700">Add Product</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover:bg-green-100 transition-colors">
                                        <FaUserPlus className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700">Add Customer</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-50 flex items-center justify-center mb-2 group-hover:bg-purple-100 transition-colors">
                                        <FaChartBar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700">View Reports</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:bg-orange-100 transition-colors">
                                        <FaCog className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700">Settings</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard; 
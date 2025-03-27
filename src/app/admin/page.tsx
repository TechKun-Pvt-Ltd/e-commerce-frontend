"use client";
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import RecentOrders from './components/RecentOrders';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8">
                    <Header title="Dashboard Overview" />
                    <div className="mt-8 space-y-8">
                        <StatsGrid />
                        <RecentOrders />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard; 
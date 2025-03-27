"use client";
import React from 'react';
import { DollarSign, ShoppingCart, UserPlus, PackagePlus } from 'lucide-react';

interface StatCard {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    changeColor: string;
}

const stats: StatCard[] = [
    {
        title: 'Total Sales',
        value: '$24,500',
        change: '+12% from last month',
        icon: <DollarSign className="w-6 h-6 text-blue-500" />,
        changeColor: 'text-green-500'
    },
    {
        title: 'Total Orders',
        value: '1,245',
        change: '+8% from last month',
        icon: <ShoppingCart className="w-6 h-6 text-purple-500" />,
        changeColor: 'text-green-500'
    },
    {
        title: 'New Customers',
        value: '156',
        change: '+5% from last month',
        icon: <UserPlus className="w-6 h-6 text-green-500" />,
        changeColor: 'text-green-500'
    },
    {
        title: 'Low Stock Items',
        value: '12',
        change: 'Need attention',
        icon: <PackagePlus className="w-6 h-6 text-orange-500" />,
        changeColor: 'text-red-500'
    }
];

const StatsGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500">{stat.title}</h3>
                        {stat.icon}
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.changeColor} mt-2`}>{stat.change}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid; 
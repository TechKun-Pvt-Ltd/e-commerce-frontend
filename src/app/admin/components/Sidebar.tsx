"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FaHome, 
    FaShoppingBag, 
    FaUsers, 
    FaChartBar, 
    FaCog, 
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaBox,
    FaShoppingCart
} from 'react-icons/fa';

interface SidebarProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, onToggleSidebar }: SidebarProps) => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/admin', icon: FaHome },
        { name: 'Products', href: '/admin/products', icon: FaBox },
        { name: 'Orders', href: '/admin/orders', icon: FaShoppingCart },
        { name: 'Customers', href: '/admin/customers', icon: FaUsers },
        { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar },
        { name: 'Settings', href: '/admin/settings', icon: FaCog },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={onToggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            >
                <span className="sr-only">Open sidebar</span>
                {isSidebarOpen ? (
                    <FaTimes className="h-6 w-6" aria-hidden="true" />
                ) : (
                    <FaBars className="h-6 w-6" aria-hidden="true" />
                )}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                                <FaShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-sm text-gray-500">E-commerce Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t">
                        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                            <FaSignOutAlt className="w-5 h-5 mr-3 text-gray-400" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar; 
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FaHome, 
    FaBox, 
    FaShoppingCart, 
    FaUsers, 
    FaChartBar, 
    FaCog, 
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';

interface SidebarProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const menuItems = [
    { name: 'Dashboard', icon: <FaHome className="w-5 h-5" />, path: '/admin' },
    { name: 'Products', icon: <FaBox className="w-5 h-5" />, path: '/admin/products' },
    { name: 'Orders', icon: <FaShoppingCart className="w-5 h-5" />, path: '/admin/orders' },
    { name: 'Customers', icon: <FaUsers className="w-5 h-5" />, path: '/admin/customers' },
    { name: 'Analytics', icon: <FaChartBar className="w-5 h-5" />, path: '/admin/analytics' },
    { name: 'Settings', icon: <FaCog className="w-5 h-5" />, path: '/admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'}`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'hidden'}`}>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                    </div>
                    <button 
                        onClick={onToggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {isSidebarOpen ? (
                            <FaTimes className="w-5 h-5 text-gray-500" />
                        ) : (
                            <FaBars className="w-5 h-5 text-gray-500" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                                ${pathname === item.path 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            {item.icon}
                            {isSidebarOpen && (
                                <span className="text-sm font-medium">{item.name}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <button 
                        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors
                            ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <FaSignOutAlt className="w-5 h-5" />
                        {isSidebarOpen && (
                            <span className="text-sm font-medium">Logout</span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar; 
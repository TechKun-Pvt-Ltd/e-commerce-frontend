"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronDown,
    BarChart3
} from 'lucide-react';

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    subItems?: { label: string; href: string }[];
}

interface SidebarProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const sidebarItems: SidebarItem[] = [
    {
        icon: <LayoutDashboard className="w-5 h-5" />,
        label: 'Dashboard',
        href: '/admin'
    },
    {
        icon: <ShoppingBag className="w-5 h-5" />,
        label: 'Orders',
        href: '/admin/orders',
        subItems: [
            { label: 'All Orders', href: '/admin/orders' },
            { label: 'Pending', href: '/admin/orders?status=pending' },
            { label: 'Processing', href: '/admin/orders?status=processing' },
            { label: 'Shipped', href: '/admin/orders?status=shipped' },
            { label: 'Delivered', href: '/admin/orders?status=delivered' }
        ]
    },
    {
        icon: <Package className="w-5 h-5" />,
        label: 'Products',
        href: '/admin/products',
        subItems: [
            { label: 'All Products', href: '/admin/products' },
            { label: 'Add Product', href: '/admin/products/new' },
            { label: 'Categories', href: '/admin/products/categories' }
        ]
    },
    {
        icon: <Users className="w-5 h-5" />,
        label: 'Customers',
        href: '/admin/customers'
    },
    {
        icon: <BarChart3 className="w-5 h-5" />,
        label: 'Analytics',
        href: '/admin/analytics'
    },
    {
        icon: <Settings className="w-5 h-5" />,
        label: 'Settings',
        href: '/admin/settings'
    }
];

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
    const router = useRouter();
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const toggleSubItems = (label: string) => {
        setExpandedItem(expandedItem === label ? null : label);
    };

    const handleLogout = () => {
        router.push('/login');
    };

    return (
        <aside className={`fixed top-0 left-0 h-screen bg-white shadow-lg transition-all duration-300 z-50 ${
            isSidebarOpen ? 'w-64' : 'w-20'
        }`}>
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b">
                    {isSidebarOpen && (
                        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                    )}
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isSidebarOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {sidebarItems.map((item) => (
                        <div key={item.label}>
                            <button
                                onClick={() => {
                                    if (item.subItems) {
                                        toggleSubItems(item.label);
                                    } else {
                                        router.push(item.href);
                                    }
                                }}
                                className={`w-full flex items-center px-4 py-2 rounded-lg mb-1 transition-colors ${
                                    expandedItem === item.label
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {item.icon}
                                {isSidebarOpen && (
                                    <>
                                        <span className="ml-3">{item.label}</span>
                                        {item.subItems && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-auto transition-transform ${
                                                    expandedItem === item.label ? 'rotate-180' : ''
                                                }`}
                                            />
                                        )}
                                    </>
                                )}
                            </button>
                            {isSidebarOpen && item.subItems && expandedItem === item.label && (
                                <div className="ml-8 space-y-1">
                                    {item.subItems.map((subItem) => (
                                        <button
                                            key={subItem.label}
                                            onClick={() => router.push(subItem.href)}
                                            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-600"
                                        >
                                            {subItem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 
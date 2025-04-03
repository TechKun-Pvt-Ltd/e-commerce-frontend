"use client";
import React from 'react';
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
                    
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Search Bar */}
                        <div className="relative hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-48 sm:w-64 lg:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {/* Mobile Search Button */}
                        <button className="sm:hidden p-2 text-gray-500 hover:text-gray-700">
                            <FaSearch className="w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:text-gray-700">
                            <FaBell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Settings */}
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                            <FaCog className="w-5 h-5" />
                        </button>

                        {/* Profile */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm sm:text-base font-medium text-gray-600">JD</span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">John Doe</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 
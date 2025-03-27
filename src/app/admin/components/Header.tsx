"use client";
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <AlertCircle className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <span className="text-gray-700">Admin User</span>
                </div>
            </div>
        </div>
    );
};

export default Header; 
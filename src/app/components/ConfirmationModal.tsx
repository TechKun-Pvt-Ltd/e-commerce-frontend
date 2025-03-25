"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    primaryAction: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    primaryAction,
    secondaryAction
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
                <div className="text-gray-600 mb-6">
                    {message}
                </div>
                <div className="flex gap-4">
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                    <button
                        onClick={primaryAction.onClick}
                        className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        {primaryAction.label}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 
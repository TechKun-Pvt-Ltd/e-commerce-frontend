"use client";
import React, { useState } from 'react';

const ShippingCalculator = () => {
    const [zipCode, setZipCode] = useState('');
    const [shippingCost, setShippingCost] = useState<number | null>(null);

    const calculateShipping = (e: React.FormEvent) => {
        e.preventDefault();
        // This would typically make an API call to calculate shipping
        // For now, we'll simulate a fixed shipping cost
        setShippingCost(9.99);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Calculate Shipping</h2>

            <form onSubmit={calculateShipping}>
                <div className="mb-4">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                    </label>
                    <input
                        type="text"
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your zip code"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                    Calculate
                </button>
            </form>

            {shippingCost !== null && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">Estimated Shipping Cost:</p>
                    <p className="text-lg font-medium text-gray-900">${shippingCost.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
};

export default ShippingCalculator;
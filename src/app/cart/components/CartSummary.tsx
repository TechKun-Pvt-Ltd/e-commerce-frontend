"use client";
import React from 'react';

const CartSummary = () => {
    // This would typically come from a cart context or state management
    const subtotal = 0;
    const shippingCost = 0;
    const tax = subtotal * 0.1; // 10% tax rate
    const total = subtotal + shippingCost + tax;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-medium text-gray-900">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                className="w-full mt-6 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                onClick={() => window.location.href = '/checkout'}
            >
                Proceed to Checkout
            </button>
        </div>
    );
};

export default CartSummary;
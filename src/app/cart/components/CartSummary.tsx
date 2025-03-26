"use client";
import React from 'react';
import { CartItem } from '@/app/types/models';

interface CartSummaryProps {
    items: CartItem[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
    const subtotal = items.reduce((total, item) => total + (item.productVariant.price * item.quantity), 0);
    const shipping = 10; // Fixed shipping cost
    const total = subtotal + shipping;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
"use client";
import React from 'react';
import CartItems from './components/CartItems';
import CartSummary from './components/CartSummary';
import ShippingCalculator from './components/ShippingCalculator';

const CartPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <CartItems />
                </div>
                <div className="lg:w-1/3 space-y-6">
                    <ShippingCalculator />
                    <CartSummary />
                </div>
            </div>
        </div>
    );
};

export default CartPage;
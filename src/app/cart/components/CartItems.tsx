"use client";
import React from 'react';
import Image from 'next/image';
import { ProductVariant } from '@/app/types/models';

interface CartItem {
    variant: ProductVariant;
    quantity: number;
}

const CartItems = () => {
    // This would typically come from a cart context or state management
    const [cartItems, setCartItems] = React.useState<CartItem[]>([]);

    const updateQuantity = (variantId: number, newQuantity: number) => {
        setCartItems(items =>
            items.map(item =>
                item.variant.productVariantId === variantId
                    ? { ...item, quantity: Math.max(1, newQuantity) }
                    : item
            )
        );
    };

    const removeItem = (variantId: number) => {
        setCartItems(items => items.filter(item => item.variant.productVariantId !== variantId));
    };

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500">Add some items to your cart to continue shopping</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {cartItems.map((item) => (
                <div key={item.variant.productVariantId} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-24 h-24 relative">
                        <Image
                            src={`https://via.placeholder.com/96?text=${encodeURIComponent(item.variant.product.name)}`}
                            alt={item.variant.product.name}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900">{item.variant.product.name}</h3>
                        <p className="text-sm text-gray-500">
                            Size: {item.variant.sizeOption.value}, Frame: {item.variant.frameOption.value}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => updateQuantity(item.variant.productVariantId, item.quantity - 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <span className="px-3 py-1 text-gray-900">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.variant.productVariantId, item.quantity + 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => removeItem(item.variant.productVariantId)}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                            ${(item.variant.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartItems;
"use client";
import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/app/types/models';

interface CartItemsProps {
    items: CartItem[];
    onQuantityChange: (variantId: number, newQuantity: number) => Promise<void>;
    onRemoveItem: (variantId: number) => Promise<void>;
}

const CartItems: React.FC<CartItemsProps> = ({ items, onQuantityChange, onRemoveItem }) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500">Add some items to your cart to continue shopping</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative w-24 h-24">
                        <Image
                            src="/placeholder-image.jpg"
                            alt={item.productVariant.name}
                            fill
                            className="object-cover rounded"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium">{item.productVariant.name}</h3>
                        <p className="text-gray-600">${item.productVariant.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={() => onQuantityChange(item.productVariant.productVariantId, item.quantity - 1)}
                                className="px-2 py-1 border rounded"
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() => onQuantityChange(item.productVariant.productVariantId, item.quantity + 1)}
                                className="px-2 py-1 border rounded"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => onRemoveItem(item.productVariant.productVariantId)}
                        className="text-red-500 hover:text-red-700"
                    >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
};

export default CartItems;
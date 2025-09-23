"use client";
import React from 'react';
import Image from 'next/image';
import { FiTrash2 } from 'react-icons/fi';
import { CartItem, CartItemPreview } from '@/types/domains/cart';
import placeholderImage from '@/../public/placeholder-image.jpeg';

interface CartItemsProps {
    items: CartItemPreview[];
    onQuantityChange: (cartItemId: number, newQuantity: number) => Promise<void>;
    onRemoveItem: (variantId: number) => Promise<void>;
}

const CartItems: React.FC<CartItemsProps> = ({ items, onQuantityChange, onRemoveItem }) => {
    console.log("CartItems rendered with items:", items);
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-24 h-24 mb-6">
                    <Image
                        src="/empty-cart.svg"
                        alt="Empty Cart"
                        width={96}
                        height={96}
                        className="opacity-50"
                    />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 text-center mb-6">Add some items to your cart to continue shopping</p>
                <button 
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {items.map((item) => (
                <div 
                    key={item.cartItemId} 
                    className="flex items-center gap-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                            src={item.imageUrl || placeholderImage}
                            alt={item.title}
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {item.title}
                                </h3>
                                <div className="text-sm text-gray-500 space-y-1">
                                    {/* <p>Size: {item.productVariant.sizeOption.value}</p> */}
                                    {/* <p>Frame: {item.productVariant.frameOption.value}</p> */}
                                </div>
                            </div>
                            <p className="text-xl font-semibold text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onQuantityChange(item.cartItemId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full 
                                             hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                    onClick={() => onQuantityChange(item.cartItemId, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full 
                                             hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => onRemoveItem(item.cartItemId)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                                <FiTrash2 className="w-5 h-5" />
                                <span>Remove</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartItems;
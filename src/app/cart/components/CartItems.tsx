"use client";
import React from 'react';
import Image from 'next/image';
import { CartItem, ProductVariant, User } from '@/app/types/models';

const CartItems = () => {
    // This would typically come from a cart context or state management
    const [cartItems, setCartItems] = React.useState<CartItem[]>([{
        cartItemId: 1,
        productVariant: {
            productVariantId: 1,
            name: 'Product 1',
            price: 10.99,
            sizeOption: {
                sizeOptionId: 1,
                value: 'Small'
            },
            frameOption: {
                frameOptionId: 1,
                value: 'Wooden' 
            }
        },
        user: {} as User,
        quantity: 1
    }]);

    const updateQuantity = (variantId: number, newQuantity: number) => {
        setCartItems(items =>
            items.map(item =>
                item.productVariant.productVariantId === variantId
                    ? { ...item, quantity: Math.max(1, newQuantity) }
                    : item
            )
        );
    };

    const removeItem = (variantId: number) => {
        setCartItems(items => items.filter(item => item.productVariant.productVariantId !== variantId));
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
                <div key={item.productVariant.productVariantId} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-24 h-24 relative">
                        <Image
                            src={`https://via.placeholder.com/96?text=${encodeURIComponent(item.productVariant.name)}`}
                            alt={item.productVariant.name}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900">{item.productVariant.name}</h3>
                        <p className="text-sm text-gray-500">
                            Size: {item.productVariant.sizeOption.value}, Frame: {item.productVariant.frameOption.value}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => updateQuantity(item.productVariant.productVariantId, item.quantity - 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <span className="px-3 py-1 text-gray-900">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.productVariant.productVariantId, item.quantity + 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => removeItem(item.productVariant.productVariantId)}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                            ${(item.productVariant.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartItems;
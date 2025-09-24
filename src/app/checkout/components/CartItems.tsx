"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { ProductPreview } from "@/types/domains/product";

interface CartItemProps {
    item: ProductPreview & { quantity: number };
    onQuantityChange: (productVariantId: number, newQuantity: number) => void;
    onRemove: (productVariantId: number) => void;
    readonly?: boolean;
}

export default function CartItem({ 
    item, 
    onQuantityChange, 
    onRemove, 
    readonly = false 
}: CartItemProps) {
    const handleDecrease = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.productVariantId, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (item.quantity < item.quantityInStock) {
            onQuantityChange(item.productVariantId, item.quantity + 1);
        }
    };

    const handleRemove = () => {
        onRemove(item.productVariantId);
    };

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-400 rounded flex-shrink-0"></div>
                <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                        ${item.price.toFixed(2)} each
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {!readonly && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={handleRemove}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                )}
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={handleDecrease}
                        disabled={readonly || item.quantity <= 1}
                    >
                        <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm w-8 text-center font-medium">
                        {item.quantity}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={handleIncrease}
                        disabled={readonly || item.quantity >= item.quantityInStock}
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                </div>
                
                <span className="font-semibold w-16 text-right">
                    ${(item.price * item.quantity).toFixed(0)}
                </span>
            </div>
        </div>
    );
}
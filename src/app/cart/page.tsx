"use client";
import React, { useState, useEffect } from 'react';
import CartItems from './components/CartItems';
import CartSummary from './components/CartSummary';
import ShippingCalculator from './components/ShippingCalculator';
import OrderSuccessModal from "../checkout/components/OrderSuccessModal";

const CheckoutPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        console.log("showModal changed:", showModal);
    }, [showModal]);

    const handleOrderPlacement = async () => {
        try {
            console.log("Order placement started...");
            const response = await fetch("/api/orders", { method: "POST" });
            const data = await response.json();
            console.log("API Response:", data);

            if (data.success) {
                console.log("Order placed successfully, Order ID:", data.orderId);
                setOrderId(data.orderId); // Save order ID for redirection
                setShowModal(true); // Show success modal
                console.log("Modal should be open now.");
            }
        } catch (error) {
            console.error("Order placement failed:", error);
        }
    };

    return (
        <div>
            <button 
                onClick={handleOrderPlacement} 
                className="bg-blue-500 text-white p-2 rounded"
            >
                Place Order
            </button>

            {/* Order Success Modal */}
            <OrderSuccessModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                orderId={orderId} 
            />
        </div>
    );
};

export default CheckoutPage;

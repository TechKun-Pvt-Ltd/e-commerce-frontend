"use client";
import React, { useState } from "react";
import ShippingAddressForm from "./components/ShippingAddressForm";
import PaymentForm from "./components/PaymentForm";
import OrderReview from "./components/OrderReview";
import OrderSuccessModal from "./components/OrderSuccessModal"; // Import Success Modal

const CheckoutPage = () => {
    const [step, setStep] = useState(1);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [orderId, setOrderId] = useState("");

    const handleShippingSubmit = (address: any) => {
        setShippingAddress(address);
        setStep(2);
    };

    const handlePaymentSubmit = (payment: any) => {
        setPaymentDetails(payment);
        setStep(3);
    };

    const handlePlaceOrder = () => {
        // API Call ke bina sirf modal open karne ke liye
        setOrderId("123456"); // Dummy order ID
        setIsSuccessModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3 space-y-6">
                    {step === 1 && <ShippingAddressForm onSubmit={handleShippingSubmit} />}
                    {step === 2 && <PaymentForm onSubmit={handlePaymentSubmit} />}
                    {step === 3 && (
                        <OrderReview
                            shippingAddress={shippingAddress}
                            paymentDetails={paymentDetails}
                            onPlaceOrder={handlePlaceOrder}
                        />
                    )}
                </div>
            </div>

            {/* Order Success Modal */}
            <OrderSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                orderId={orderId}
            />
        </div>
    );
};

export default CheckoutPage;

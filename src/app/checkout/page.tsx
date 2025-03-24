"use client";
import React from 'react';
import ShippingAddressForm from './components/ShippingAddressForm';
import PaymentForm from './components/PaymentForm';
import OrderReview from './components/OrderReview';

const CheckoutPage = () => {
    const [step, setStep] = React.useState(1);
    const [shippingAddress, setShippingAddress] = React.useState(null);
    const [paymentDetails, setPaymentDetails] = React.useState(null);

    const handleShippingSubmit = (address: any) => {
        setShippingAddress(address);
        setStep(2);
    };

    const handlePaymentSubmit = (payment: any) => {
        setPaymentDetails(payment);
        setStep(3);
    };

    const handlePlaceOrder = async () => {
        // Here we would typically make an API call to create the order
        console.log('Order placed', { shippingAddress, paymentDetails });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3 space-y-6">
                    {step === 1 && (
                        <ShippingAddressForm onSubmit={handleShippingSubmit} />
                    )}
                    {step === 2 && (
                        <PaymentForm onSubmit={handlePaymentSubmit} />
                    )}
                    {step === 3 && (
                        <OrderReview
                            shippingAddress={shippingAddress}
                            paymentDetails={paymentDetails}
                            onPlaceOrder={handlePlaceOrder}
                        />
                    )}
                </div>

                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Progress</h2>
                        <div className="space-y-4">
                            <div className={`flex items-center ${step >= 1 ? 'text-blue-500' : 'text-gray-400'}`}>
                                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3">
                                    1
                                </div>
                                Shipping Address
                            </div>
                            <div className={`flex items-center ${step >= 2 ? 'text-blue-500' : 'text-gray-400'}`}>
                                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3">
                                    2
                                </div>
                                Payment Details
                            </div>
                            <div className={`flex items-center ${step >= 3 ? 'text-blue-500' : 'text-gray-400'}`}>
                                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3">
                                    3
                                </div>
                                Review & Place Order
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
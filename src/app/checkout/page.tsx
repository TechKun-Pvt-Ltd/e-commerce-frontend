"use client";
import React, { useState } from "react";
import ShippingAddressForm from "./components/ShippingAddressForm";
import PaymentForm from "./components/PaymentForm";
import OrderReview from "./components/OrderReview";
import OrderSuccessModal from "./components/OrderSuccessModal";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { useRouter } from 'next/navigation';
import { OrderItem, OrderStatus, ShopOrder } from "@/types/domains/order";
import { ProductImage } from "@/types/domains/product";

interface ShippingFormData {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface PaymentFormData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

const CheckoutPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { items: cartItems } = useAppSelector(state => state.cart);
    const [step, setStep] = useState(1);
    const [shippingAddress, setShippingAddress] = useState<ShippingFormData | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<PaymentFormData | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [orderId, setOrderId] = useState("");

    const handleShippingSubmit = (data: ShippingFormData) => {
        setShippingAddress(data);
        setStep(2);
    };

    const handlePaymentSubmit = (data: PaymentFormData) => {
        setPaymentDetails(data);
        setStep(3);
    };

    const handlePlaceOrder = async () => {
        if (!shippingAddress || !paymentDetails) return;

        try {
            const orderData: Partial<ShopOrder> = {
                orderItems: cartItems.map(item => ({
                    orderItemId: 0, // Will be set by the backend
                    productVariantId: item.productVariantId,
                    image: {
                        productImageId: 0,
                        imageUrl: '/placeholder-image.jpg'
                    } as ProductImage,
                    quantity: item.quantity,
                    price: item.price
                } as OrderItem)),
                // paymentType: 'CREDIT_CARD',
                orderDate: new Date(),
                // orderTotal: cartItems.reduce((total, item) => total + (item.productVariant.price * item.quantity), 0),
                status: OrderStatus.PENDING
            };

            // const result = await dispatch(createOrder(orderData));
            // if (createOrder.fulfilled.match(result)) {
            //     setOrderId(result.payload.orderId);
            //     setIsSuccessModalOpen(true);
            //     dispatch(clearCart());
            // }
        } catch (error) {
            console.error("Order placement failed:", error);
        }
        router.push('/orders');
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

            <OrderSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                orderId={orderId}
            />
        </div>
    );
};

export default CheckoutPage;

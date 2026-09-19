import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";

export interface PaymentInitiateRequest {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    installment: number;
    items: Array<{
        productVariantId: number;
        shippingMethodId: number;
        price: number;
        quantity: number;
        productName: string;
        categoryName: string;
    }>;
    shippingAddressId?: number;
    shippingAddress?: {
        street: string;
        city: string;
        pincode: string;
        country: string;
    };
    subtotalAmount: number;
    shippingAmount: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    isGuest?: boolean;
    guestFullName?: string;
    guestEmail?: string;
    guestPhoneNo?: string;
}

export interface PaymentInitiateResponse {
    htmlContent: string;
    conversationId: string;
    orderId: string;
    trackingNumber?: string;
}

export const initiatePayment: ServiceFunction<PaymentInitiateRequest, PaymentInitiateResponse> = (payload) => {
    return servicesApiClient.post("/iyzico/initiate", { data: payload });
};

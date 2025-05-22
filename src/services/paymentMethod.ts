import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { PaymentMethod, PaymentMethodDTO } from "@/types/domains/payment_method";


export const createPaymentMethod: ServiceFunction<PaymentMethodDTO, PaymentMethod> = (payload) => {
    return servicesApiClient.post('/payment-methods', { data: payload });
};

export const getAllPaymentMethods: ServiceFunction<[disabled?: boolean], PaymentMethod[]> = (disabled) => {
    return servicesApiClient.get(`/payment-methods`, { params: { disabled } });
};

export const updatePaymentMethod: ServiceFunction<[paymentMethodId: number, payload: PaymentMethodDTO], PaymentMethod> = (paymentMethodId, payload) => {
    return servicesApiClient.put(`/payment-methods/${paymentMethodId}`, { data: payload });
};

export const deletePaymentMethod: ServiceFunction<[paymentMethodId: number], void> = (paymentMethodId) => {
    return servicesApiClient.delete(`/payment-methods/${paymentMethodId}`);
};
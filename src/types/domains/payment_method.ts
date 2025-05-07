export interface PaymentMethod {
    paymentMethodId: number;
    paymentType: string;
    disabled: boolean;
}

export interface PaymentMethodDTO {
    paymentType: string;
    disabled: boolean;
}
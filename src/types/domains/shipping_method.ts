export interface ShippingMethod {
    shippingMethodId: number;
    service: string;
    country: string;
    price: number;
    disabled: boolean;
}

export interface ShippingMethodDTO {
    service: string;
    country: string;
    price: number;
    disabled: boolean;
}
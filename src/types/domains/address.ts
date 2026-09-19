export interface AddressDTO {
    street: string;
    city: string;
    state?: string;
    pincode: string;
    country: string;
}

export interface Address {
    addressId: number;
    street: string;
    city: string;
    state?: string;
    pincode: string;
    country: string;
}
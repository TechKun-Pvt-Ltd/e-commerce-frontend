import { SortOption } from "../api";
import { Address, AddressDTO } from "./address";
import { PaymentMethod } from "./payment_method";
import { Personalization } from "./personalization";
import { ShippingMethod } from "./shipping_method";
import { CustomerContact, ShopUser } from "./user";

export interface OrderCreatePayload {
    items: OrderItemDTO[];
    shippingAddressId: number;
    shippingAddress: AddressDTO;
    paymentMethodId: number;
}

export interface OrderItemDTO {
    orderItemId: number;
    productVariantId: number;
    estimatedDeliveryDate: Date;
    personalization: Personalization;
    price: number;
    shippingMethodId: number;
    quantity: number;
}

export interface OrderDetails {
    shopOrderId: number;
    customer: CustomerContact;
    orderDate: Date;
    estimatedDeliveryDate: Date;
    orderItems: OrderItem[];
    shippingMethod: ShippingMethod;
    shippingAddress: Address;
    shippingProvider: string;
    paymentMethod: PaymentMethod;
    paymentProvider: string;
    carrierName: string;
    trackingNumber: string;
    orderStatus: OrderStatus;
}


export interface OrderPreviewDTO {
    orderId: number;
    orderDate: Date;
    customer: CustomerContact;
    estimatedDeliveryDate: Date;
    status: OrderStatus;
    shipmentMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    shippingProvider: string;
    paymentProvider: string;
    carrierName: string;
    trackingNumber: string;
    totalPrice: number;
}

export interface OrderQueryOptions {
    statuses: string[];
    fromDate: Date;
    toDate: Date;
    customerName: string;
    trackingNumber: string;
    sortBy: SortOption;
}

export interface OrderUpdatePayload {
    estimatedDeliveryDate: Date;
    trackingNumber: string;
    status: OrderStatus;
    shippingAddressId: number;
    shippingAddress: AddressDTO;
    items: OrderItemDTO[];
    paymentMethodId: number;
    paymentProvider: string;
    shippingMethodId: number;
    shippingProvider: string;
}

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED"
}

export interface ShopOrder {
    orderId: number;
    orderItems: OrderItem[];
    customer: ShopUser;
    orderDate: Date;
    estimatedDeliveryDate: Date;
    shippingMethod: ShippingMethod;
    shippingAddress: Address;
    shippingProvider: string;
    paymentMethod: PaymentMethod;
    paymentProvider: string;
    carrierName: string;
    trackingNumber: string;
    status: OrderStatus;
}

export interface OrderItem {
    orderItemId: number;
    // shopOrder: ShopOrder;
    productVariantId: number;
    quantity: number;
    price: number;
    personalization?: Personalization;
}


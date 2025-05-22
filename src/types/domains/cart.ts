import { Personalization } from "./personalization";
import { ProductImage, ProductVariant } from "./product";
import { ShopUser } from "./user";

export type CartItemPreview = {
    cartItemId: number;
    addedAt: Date;
    imageUrl?: string;
    title: string;
    productVariantId: number;
    sku: string;
    price: number;
    quantityInStock: number;
    quantity: number;
    personalization?: Personalization;
};

export type CartItemDTO = {
    productImageId?: number;
    productVariantId: number;
    quantity: number;
    personalization?: Personalization;
};

export interface CartItemUpdatePayload {
    quantity: number;
    personalization: Personalization;
};

export type CartItem = {
    cartItemId: number;
    customer: ShopUser;
    productVariant: ProductVariant;
    productImage: ProductImage;
    quantity: number;
    personalization: Personalization;
    addedAt: Date;
};

// Assuming Personalization, ShopUser, ProductVariant, and ProductImage are defined elsewhere
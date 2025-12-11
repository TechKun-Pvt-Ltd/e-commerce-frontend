import { ProductVariant } from "./product";
import { ShopUser } from "./user";

export interface WishlistItem {
    wishlistItemId: number;
    productVariant: ProductVariant;
    customer: ShopUser;
}

export interface WishlistItemDTO {
    wishlistItemId: number;
    productImageUrl: string;
    productVariant: {
        productVariantId: number;
        sku: string;
        quantityInStock: number;
        price: number;
    };
}
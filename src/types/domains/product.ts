import { SortOption } from "../api";
import { Attribute } from "./attribute";
import { VariationOption } from "./variation";

export interface Product {
    productId: number;
    categoryId: number;
    title: string;
    description: string;
    dateAdded: string;
    starred: boolean;
    variants: ProductVariant[];
    productImages: ProductImage[];
    attributes: ProductAttribute[];
}

export interface ProductVariant {
    productVariantId: number;
    sku: string;
    disabled: boolean;
    quantityInStock: number;
    price: number;
    // product: Product;
    variationOptions: {
        variationOptionId: number;
        name: string;
        variationId: number;
    }[];
}

export interface ProductAttribute {
    productAttributeId: number;
    // product: Product;
    attribute: Attribute;
    value: string;
}

export interface ProductImage {
    productImageId: number;
    imageUrl: string;
    isDefault: boolean;
    // product: Product;
}

export interface ProductDetails {
    productId: number;
    images: ProductImage[];
    title: string;
    categoryId: number;
    variants: ProductVariant[];
    description: string;
}

export interface ProductPatchPayload {
    title: string;
    starred: boolean;
    categoryId: number;
}

export interface ProductPayload {
    title: string;
    description: string;
    starred: boolean;
    categoryId: number;
    variants: {
        productVariantId?: number;
        sku: string;
        quantityInStock: number;
        price: number;
        disabled: boolean;
        variationOptionIds: number[];
    }[];
    attributes: {
        attributeId: number;
        value: string;
    }[];
}

export interface ProductPreview {
    productId: number;
    productVariantId: number;
    categoryId: number;
    dateAdded: Date;
    quantityInStock: number;
    imageUrl: string;
    price: number;
    title: string;
    rating: number;
    starred: boolean;
}

export interface ProductQueryOptions {
    searchInput?: string;
    categoryId?: number;
    variations?: Record<number, number>;
    sortBy?: SortOption;
}
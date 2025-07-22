import { SortOption } from "../api";
import { Attribute } from "./attribute";

export interface Product {
    productId: number;
    categoryId: number;
    title: string;
    code: string;
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
    code: string;
    categoryId: number;
    variants: (Omit<ProductVariant, 'variationOptions'> & {variantProperties : {[variationId: number] : {variationOptionId: number , name: string}}})[];
    description: string;
    attributes: ProductAttribute[];
    starred: boolean;
}

export interface ProductPatchPayload {
    title: string;
    starred: boolean;
    categoryId: number;
}

export interface ProductPayload {
    title: string;
    code: string;
    description: string;
    starred: boolean;
    categoryId: number;
    images: {
        productImageId?: number;
        imageUrl: string;
        isDefault: boolean;
    }[];
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
    code: string;
    rating: number;
    starred: boolean;
}

export interface ProductQueryOptions {
    searchInput?: string;
    categoryId?: number;
    variations?: Record<number, number>;
    sortBy?: SortOption;
}
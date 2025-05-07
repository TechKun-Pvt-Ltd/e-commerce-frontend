import { Attribute } from "./attribute";
import { Variation } from "./variation";

export interface Category {
    categoryId: number;
    name: string;
    parentCategory?: Category;
    variations: Variation[];
    attributes: Attribute[];
}

export interface CategoryTree {
    categoryId: number;
    name: string;
    subcategories: CategoryTree[];
}

export interface CategoryDetails {
    categoryId: number;
    name: string;
    parentCategory?: CategoryDetails;
    variations: VariationDTO[];
    attributes: Attribute[];
}

export interface VariationDTO {
    variationId: number;
    name: string;
}

export interface CategoryDTO {
    name: string;
    parentCategoryId?: number;
    variationIds: number[];
    attributeIds: number[];
}
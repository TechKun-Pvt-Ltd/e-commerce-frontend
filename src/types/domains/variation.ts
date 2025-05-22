export interface Variation {
    variationId: number;
    name: string;
    variationOptions: VariationOption[];
}

export interface VariationOption {
    variationOptionId: number;
    name: string;
}
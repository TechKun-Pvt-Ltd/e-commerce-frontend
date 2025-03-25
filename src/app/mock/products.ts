import { Product } from "../types/models";

export const mockProducts: Product[] = [
    {
        productId: 1,
        name: "Classic Wall Art",
        description: "Beautiful classic wall art piece",
        images: [],
        variants: [
            {
                productVariantId: 1,
                name: "Classic Wall Art (Small, Black Wood)",
                price: 99.99,
                sizeOption: { sizeOptionId: 1, value: "Small (8x10)" },
                frameOption: { frameOptionId: 1, value: "Black Wood" }
            },
            {
                productVariantId: 2,
                name: "Classic Wall Art (Medium, Gold Metal)",
                price: 149.99,
                sizeOption: { sizeOptionId: 2, value: "Medium (16x20)" },
                frameOption: { frameOptionId: 2, value: "Gold Metal" }
            }
        ]
    },
    {
        productId: 2,
        name: "Modern Abstract Print",
        description: "Contemporary abstract art design",
        images: [],
        variants: [
            {
                productVariantId: 3,
                name: "Modern Abstract Print (Small, White Wood)",
                price: 129.99,
                sizeOption: { sizeOptionId: 1, value: "Small (8x10)" },
                frameOption: { frameOptionId: 3, value: "White Wood" }
            },
            {
                productVariantId: 4,
                name: "Modern Abstract Print (Medium, Silver Metal)",
                price: 179.99,
                sizeOption: { sizeOptionId: 2, value: "Medium (16x20)" },
                frameOption: { frameOptionId: 4, value: "Silver Metal" }
            }
        ]
    }
];
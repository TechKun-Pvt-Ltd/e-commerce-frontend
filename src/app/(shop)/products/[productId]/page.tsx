"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Product } from "@/types/domains/product"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Variation } from "@/types/domains/variation";
import useDataFetch from "@/hooks/use-data-fetch";
import { AttributeType } from "@/types/domains/attribute";
import { ProductReviews } from "../Components/ProductReviews";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";

// ... (keep your existing product data and variations objects)

const product: Product = {
    productId: 1,
    categoryId: 101,
    title: "Premium Wireless Headphones",
    description:
        "Experience high-fidelity audio with our noise-cancelling, over-ear wireless headphones. Built for comfort and performance.",
    dateAdded: "2025-04-10T00:00:00Z",
    starred: true,
    productImages: [
        {
            productImageId: 1,
            imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
            isDefault: true,
        },
        {
            productImageId: 2,
            imageUrl: "https://example.com/images/headphones2.png",
            isDefault: false,
        },
    ],
    // ... (keep your existing variants and attributes)
    variants: [
        // ... (keep your existing variants)
    ],
    attributes: [
        // ... (keep your existing attributes)
    ],
};

const variations: { [variationId: number]: (Omit<Variation, "variationOptions">) } = {
    1: {
        variationId: 1,
        name: "Color",
    },
    2: {
        variationId: 2,
        name: "Fit Type",
    },
    3: {
        variationId: 3,
        name: "Connection Type"
    }
};

type VariationMap = {
    [variationId: number]: {
        variationName: string;
        selectedOptionId?: number;
        options: {
            [variationOptionId: number]: {
                name: string;
                priceRange: [number, number];
            }
        };
    }
};

type VariantSelectionState = {
    priceRange: [number, number];
    variationMap: VariationMap;
};

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = React.use(params);

    // Get user information from Redux store
    const { user, loading: authLoading } = useAppSelector(state => state.auth);

    // State for product variations
    const [activeImage, setActiveImage] = useState(() =>
        product?.productImages.find(img => img.isDefault) ?? product?.productImages[0]
    );

    const [{ priceRange, variationMap }, setVariantSelectionState] = useState<VariantSelectionState>({
        priceRange: [0, 0],
        variationMap: {},
    });

    // Helper functions to check user roles
    const isAdmin = user?.roleName === UserRole.ADMIN;
    const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
    const isCustomer = user?.roleName === UserRole.CUSTOMER;
    const canModerate = isAdmin || isPlatformAdmin;

    // Get current customer ID if user is a customer
    const currentCustomerId = isCustomer ? user?.userId : undefined;

    const initializeVariantSelectionState = useCallback((): VariantSelectionState => {
        const initialPriceRange: [number, number] = [Infinity, -Infinity];
        const initialVariationMap = (product?.variants || []).reduce((acc, cur) => {
            initialPriceRange[0] = Math.min(initialPriceRange[0], cur.price);
            initialPriceRange[1] = Math.max(initialPriceRange[1], cur.price);

            cur.variationOptions.forEach(opt => {
                const variation = acc[opt.variationId] = acc[opt.variationId] ?? {
                    variationName: variations[opt.variationId].name,
                    options: {}
                };
                const variationOption = variation.options[opt.variationOptionId] = variation.options[opt.variationOptionId] ?? {
                    name: opt.name,
                    priceRange: [cur.price, cur.price],
                };
                variationOption.priceRange = [
                    Math.min(variationOption.priceRange[0], cur.price),
                    Math.max(variationOption.priceRange[1], cur.price)
                ];
            });
            return acc;
        }, {} as VariationMap);

        return {
            priceRange: initialPriceRange,
            variationMap: initialVariationMap,
        };
    }, [product]);

    const onSelectVariation = useCallback((variationId: number, optionId: number) => {
        setVariantSelectionState(prev => {
            const { variationMap: currentVarMap } = prev;
            const newPriceRange: [number, number] = [Infinity, -Infinity];
            currentVarMap[variationId].selectedOptionId = optionId;
            const optionsIncluded: { [varOptId: number]: boolean } = {};
            for (const v of Object.values(currentVarMap)) {
                for (const _optId of Object.keys(v.options)) {
                    const optId = Number(_optId);
                    optionsIncluded[optId] = optionsIncluded[optId] ?? (
                        v.selectedOptionId === undefined || v.selectedOptionId === optId
                    );
                }
            }

            const newVariationMap = (product?.variants || [])
                .reduce((newVarMap, currentVariant) => {
                    const variantOptionsIncluded: { [varOptId: number]: boolean } = {};
                    let i = 0;
                    let acc = true;
                    while (i < currentVariant.variationOptions.length) {
                        const opt = currentVariant.variationOptions[i];
                        variantOptionsIncluded[opt.variationOptionId] = acc;
                        acc = acc && optionsIncluded[opt.variationOptionId];
                        i++;
                    }
                    i--;
                    acc = true;
                    while (i >= 0) {
                        const opt = currentVariant.variationOptions[i];
                        variantOptionsIncluded[opt.variationOptionId] = variantOptionsIncluded[opt.variationOptionId] && acc;
                        acc = acc && optionsIncluded[opt.variationOptionId];
                        i--;
                    }

                    if (acc) {
                        newPriceRange[0] = Math.min(newPriceRange[0], currentVariant.price);
                        newPriceRange[1] = Math.max(newPriceRange[1], currentVariant.price);
                    }

                    currentVariant.variationOptions
                        .forEach(opt => {
                            if (!variantOptionsIncluded[opt.variationOptionId])
                                return;

                            const variation = newVarMap[opt.variationId] = opt.variationId in newVarMap ?
                                newVarMap[opt.variationId] : {
                                    ...currentVarMap[opt.variationId],
                                    options: {}
                                };
                            if (opt.variationOptionId in variation.options) {
                                const variationOption = variation.options[opt.variationOptionId];
                                variationOption.priceRange[0] = Math.min(
                                    variationOption.priceRange[0],
                                    currentVariant.price
                                );
                                variationOption.priceRange[1] = Math.max(
                                    variationOption.priceRange[1],
                                    currentVariant.price
                                );
                            } else {
                                variation.options[opt.variationOptionId] = {
                                    name: opt.name,
                                    priceRange: [currentVariant.price, currentVariant.price]
                                };
                            }
                        });

                    return newVarMap;
                }, {} as VariationMap);

            return {
                priceRange: newPriceRange,
                variationMap: newVariationMap,
            };
        });
    }, [product]);

    useEffect(() => {
        product && setVariantSelectionState(initializeVariantSelectionState());
    }, [product]);

    return (
        <div>
            <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                    <div className="border rounded-md overflow-hidden">
                        <img
                            src={activeImage?.imageUrl}
                            alt="Product preview"
                            className="w-full h-[400px] object-contain"
                        />
                    </div>
                    <div className="mt-4 flex gap-2">
                        {product?.productImages.map(img => (
                            <Button
                                key={img.productImageId}
                                onClick={() => setActiveImage(img)}
                                className={`border rounded-md p-1 w-16 h-16 ${activeImage?.productImageId === img.productImageId ? "border-primary" : "border-muted"}`}
                            >
                                <img src={img.imageUrl} alt="thumb" className="object-cover w-full h-full" />
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">{product?.title}</h1>
                    <p className="text-muted-foreground">{product?.description}</p>

                    {/* Attribute List */}
                    <div className="space-y-2">
                        {product?.attributes?.map((attr) => (
                            <div key={attr.productAttributeId} className="text-sm">
                                <span className="font-medium">{attr.attribute.name}: </span>
                                <span>{attr.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Variation Selects */}
                    <div className="space-y-4">
                        {Object.entries(variationMap).map(([key, value]) => (
                            <div key={key}>
                                <label className="text-sm font-medium">{value.variationName}</label>
                                <Select
                                    onValueChange={v => onSelectVariation(
                                        Number.parseInt(key), Number.parseInt(v)
                                    )}
                                    value={value.selectedOptionId !== undefined && value.selectedOptionId !== null ?
                                        String(value.selectedOptionId) :
                                        undefined
                                    }>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={`Select ${value.variationName}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(value.options)
                                            .sort(([, a], [, b]) => a.priceRange[0] - b.priceRange[0])
                                            .map(([optKey, optValue]) => {
                                                const [lowerValue, upperValue] = optValue.priceRange.map(a => a.toFixed(2));
                                                return (
                                                    <SelectItem key={optKey} value={String(optKey)}>
                                                        {optValue.name} {value.selectedOptionId !== Number(optKey) ?
                                                            `(${lowerValue === upperValue ?
                                                                `$${lowerValue}` :
                                                                `$${lowerValue} - $${upperValue}`
                                                            })` :
                                                            ""
                                                        }
                                                    </SelectItem>
                                                );
                                            })
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    {/* Variant Info */}
                    <div className="space-y-1">
                        <div className="text-lg font-semibold text-primary">
                            {priceRange[0] === priceRange[1] ? `$${priceRange[0]}` : `$${priceRange[0]} - $${priceRange[1]}`}
                        </div>
                    </div>

                    <Button size="lg" className="w-full">
                        Add to Cart
                    </Button>
                </div>
            </div>
            
            {/* Reviews Section */}
            <div className="min-h-screen bg-gradient-to-br from-background to-product-bg">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <ProductReviews
                        productId={Number(productId)}
                      
                    />
                </div>
            </div>
        </div>
    )
};
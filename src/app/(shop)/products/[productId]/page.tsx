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
import { AttributeType } from "@/types/domains/attribute";
import { ProductReviews } from "../Components/ProductReviews";

import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import ProductCard from "@/app/components/ProductCard";

const products: any[] = [
    {
        "productId": 101,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/b8/98/4e/b8984e1d41ef5987dcd45d239aa641fd.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true

    },
    {
        "productId": 102,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/93/3b/f1/933bf196b3e96ad63cf7e28537008244.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 103,
        "productVariantId": 203,
        "categoryId": 12,
        "dateAdded": "2025-08-04T15:15:00Z",
        "quantityInStock": 45,
        "imageUrl": "https://i.pinimg.com/736x/27/89/70/278970ef6800d537b042bbebb142473d.jpg",
        "price": 749.00,
        "title": "Golden Antique Frame",
        "code": "FRAME-GLD-2025",
        "rating": 4.9,
        "starred": true
    }, {
        "productId": 104,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/14/6c/20/146c20591a0c03ad90c8a08f42cf3624.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true

    },
    {
        "productId": 105,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/a6/6d/46/a66d46545c57675eff9d6d2472ff5407.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 106,
        "productVariantId": 203,
        "categoryId": 12,
        "dateAdded": "2025-08-04T15:15:00Z",
        "quantityInStock": 45,
        "imageUrl": "https://i.pinimg.com/1200x/35/ca/d9/35cad961cbbc05fa924bf8054b0e01bb.jpg",
        "price": 749.00,
        "title": "Golden Antique Frame",
        "code": "FRAME-GLD-2025",
        "rating": 4.9,
        "starred": true
    }, {
        "productId": 107,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/736x/42/de/7b/42de7bb703fca6d7b52b68c2affd949f.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true

    },
    {
        "productId": 108,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/1200x/8e/1d/81/8e1d81152c50bb4ace7609fe6a10491e.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },


];


const product: Product = {
    productId: 1,
    categoryId: 101,
    title: "Premium Wireless Headphones",
    description:
        "Elevate your everyday style with our Essential Polos, the perfect blend of comfort and sophistication. Crafted from premium, breathable fabric, these polos offer a tailored fit that’s ideal for both casual outings and smart-casual settings. Designed with classic collars and subtle detailing, they bring timeless appeal to your wardrobe. Available in a range of versatile colors, they pair effortlessly with jeans, chinos, or shorts. Whether you’re heading to the office or a weekend brunch, Essential Polos keep you looking sharp and feeling comfortable all day long.",
    dateAdded: "2025-04-10T00:00:00Z",
    starred: true,
    productImages: [
        {
            productImageId: 1,
            imageUrl: "https://i.pinimg.com/736x/2f/89/ba/2f89ba6de7afbb51d329c30c475f9e55.jpg",
            isDefault: true,
        },
        {
            productImageId: 2,
            imageUrl: "https://i.pinimg.com/736x/61/81/70/6181701187f9e48136eecc8b8a622acf.jpg",
            isDefault: false,
        },
        {
            productImageId: 3,
            imageUrl: "https://i.pinimg.com/736x/aa/09/d2/aa09d28585253a74c08dcac92dabac60.jpg",
            isDefault: false,
        },
        {
            productImageId: 4,
            imageUrl: "https://i.pinimg.com/1200x/4f/53/78/4f53789fb9723f36fb201ca7b61beb90.jpg",
            isDefault: false,
        },
    ],
    variants: [
        {
            productVariantId: 101,
            sku: "WH-1000XM5-BLK-BT",
            disabled: false,
            quantityInStock: 28,
            price: 369.99,
            variationOptions: [
                {
                    variationOptionId: 1,
                    name: "Black",
                    variationId: 1,
                },
                {
                    variationOptionId: 4,
                    name: "Over-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 6,
                    name: "Bluetooth",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 102,
            sku: "WH-1000XM5-SLV-BT",
            disabled: false,
            quantityInStock: 12,
            price: 349.99,
            variationOptions: [
                {
                    variationOptionId: 2,
                    name: "Silver",
                    variationId: 1,
                },
                {
                    variationOptionId: 4,
                    name: "Over-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 6,
                    name: "Bluetooth",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 103,
            sku: "WH-1000XM5-GLD-BT",
            disabled: false,
            quantityInStock: 15,
            price: 379.99,
            variationOptions: [
                {
                    variationOptionId: 3,
                    name: "Gold",
                    variationId: 1,
                },
                {
                    variationOptionId: 4,
                    name: "Over-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 6,
                    name: "Bluetooth",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 104,
            sku: "WH-1000XM5-BLK-ON-BT",
            disabled: false,
            quantityInStock: 20,
            price: 329.99,
            variationOptions: [
                {
                    variationOptionId: 1,
                    name: "Black",
                    variationId: 1,
                },
                {
                    variationOptionId: 5,
                    name: "On-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 6,
                    name: "Bluetooth",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 105,
            sku: "WH-1000XM5-SLV-ON-BT",
            disabled: false,
            quantityInStock: 18,
            price: 319.99,
            variationOptions: [
                {
                    variationOptionId: 2,
                    name: "Silver",
                    variationId: 1,
                },
                {
                    variationOptionId: 5,
                    name: "On-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 6,
                    name: "Bluetooth",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 106,
            sku: "WH-1000XM5-GLD-ON-BT",
            disabled: false,
            quantityInStock: 10,
            price: 339.99,
            variationOptions: [
                {
                    variationOptionId: 3,
                    name: "Gold",
                    variationId: 1,
                },
                {
                    variationOptionId: 5,
                    name: "On-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 6,
                    name: "Bluetooth",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 107,
            sku: "WH-1000XM5-BLK-WR",
            disabled: false,
            quantityInStock: 25,
            price: 339.99,
            variationOptions: [
                {
                    variationOptionId: 1,
                    name: "Black",
                    variationId: 1,
                },
                {
                    variationOptionId: 4,
                    name: "Over-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 7,
                    name: "Wired",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 108,
            sku: "WH-1000XM5-SLV-WR",
            disabled: false,
            quantityInStock: 15,
            price: 319.99,
            variationOptions: [
                {
                    variationOptionId: 2,
                    name: "Silver",
                    variationId: 1,
                },
                {
                    variationOptionId: 4,
                    name: "Over-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 7,
                    name: "Wired",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 109,
            sku: "WH-1000XM5-GLD-WR",
            disabled: false,
            quantityInStock: 12,
            price: 349.99,
            variationOptions: [
                {
                    variationOptionId: 3,
                    name: "Gold",
                    variationId: 1,
                },
                {
                    variationOptionId: 4,
                    name: "Over-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 7,
                    name: "Wired",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 110,
            sku: "WH-1000XM5-BLK-ON-WR",
            disabled: false,
            quantityInStock: 18,
            price: 299.99,
            variationOptions: [
                {
                    variationOptionId: 1,
                    name: "Black",
                    variationId: 1,
                },
                {
                    variationOptionId: 5,
                    name: "On-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 7,
                    name: "Wired",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 111,
            sku: "WH-1000XM5-SLV-ON-WR",
            disabled: false,
            quantityInStock: 14,
            price: 289.99,
            variationOptions: [
                {
                    variationOptionId: 2,
                    name: "Silver",
                    variationId: 1,
                },
                {
                    variationOptionId: 5,
                    name: "On-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 7,
                    name: "Wired",
                    variationId: 3,
                },
            ],
        },
        {
            productVariantId: 112,
            sku: "WH-1000XM5-GLD-ON-WR",
            disabled: false,
            quantityInStock: 8,
            price: 309.99,
            variationOptions: [
                {
                    variationOptionId: 3,
                    name: "Gold",
                    variationId: 1,
                },
                {
                    variationOptionId: 5,
                    name: "On-Ear",
                    variationId: 2,
                },
                {
                    variationOptionId: 7,
                    name: "Wired",
                    variationId: 3,
                },
            ],
        },
    ],
    attributes: [
        {
            productAttributeId: 1,
            attribute: {
                attributeId: 1,
                name: "Battery Life",
                type: AttributeType.CUSTOM,
                allowedValues: []
            },
            value: "30 hours",
        },
        {
            productAttributeId: 2,
            attribute: {
                attributeId: 2,
                name: "Connectivity",
                type: AttributeType.ENUMERATED,
                allowedValues: ["Bluetooth", "Wired"],
            },
            value: "Bluetooth",
        },
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



    const [activeImage, setActiveImage] = useState(() =>
        product?.productImages.find(img => img.isDefault) ?? product?.productImages[0]
    );

    const [{ priceRange, variationMap }, setVariantSelectionState] = useState<VariantSelectionState>({
        priceRange: [0, 0],
        variationMap: {},
    });

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



    const { user, loading } = useAppSelector(state => state.auth);
    // Helper functions to check user roles
    const isAdmin = user?.roleName === UserRole.ADMIN;
    const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
    const isCustomer = user?.roleName === UserRole.CUSTOMER;


    const currentCustomerId = isCustomer ? user?.userId : undefined;



    return (
        <div className="responsive-container">
            <div className="relative p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div>
                    <div className="border rounded-md overflow-hidden">
                        <img
                            src={activeImage?.imageUrl}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="mt-4 flex justify-between">
                        {product?.productImages.map(img => (
                            <Button
                                key={img.productImageId}
                                onClick={() => setActiveImage(img)}
                                className={`rounded-md  p-0 w-35 h-35 ${activeImage?.productImageId === img.productImageId ? "border-black border-3 z-10" : "border-mute"}`}
                            >
                                <img src={img.imageUrl} alt="thumb" className=" rounded-sm w-full h-full" />
                            </Button>
                        ))}
                    </div>
                    <div className="py-8 ">
                        <ProductReviews
                            productId={Number(productId)}
                            currentCustomerId={currentCustomerId}
                        />
                    </div>
                </div>


                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">{product?.title}</h1>
                    {/* <p className="text-muted-foreground">{product?.description}</p> */}

                    {/* Attribute List */}
                    <div className="flex gap-8 space-y-2 ">
                        {product?.attributes?.map((attr) => (
                            <div key={attr.productAttributeId} className="text-sm ">
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

                    {/* Variant Info (mocked default) */}
                    <div className="space-y-1">
                        <div className="text-lg font-semibold text-primary">
                            {priceRange[0] === priceRange[1] ? `$${priceRange[0]}` : `$${priceRange[0]} - $${priceRange[1]}`}
                        </div>
                        {/* <div className="text-sm text-muted-foreground">
                        {product.variants[0]?.quantityInStock} in stock
                    </div> */}
                    </div>
                    <div className=" border w-full  rounded-md  p-4">
                        <h1 className="mt-[-30px] text-center text-xl font-bold">Safe Chackout</h1>
                        <div className="flex items-center justify-center mt-8">
                            <img src="/online-payments.png" alt="Online-Payments" className="w-72" />
                        </div>
                    </div>

                    <Button size="lg" className="w-full">
                        Add to Cart
                    </Button>

                    <h1 className="text-2xl font-bold"> Description </h1>
                    <p className="text-muted-foreground">{product?.description}</p>

                </div>
            </div>
            <div>
                <h1 className="text-3xl text-center font-bold mb-16"> Related Products</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

                    {
                        products.slice(0, 4).map((product) => (
                            <ProductCard key={product.productId} product={product} promo={null} />
                        ))
                    }
                </div>
            </div>
        </div>
    )
};
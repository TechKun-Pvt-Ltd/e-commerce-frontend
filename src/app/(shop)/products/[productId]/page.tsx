/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Product, ProductDetails, ProductImage } from "@/types/domains/product"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Variation } from "@/types/domains/variation";
import { ProductReviews } from "../Components/ProductReviews";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import ProductCard from "@/app/components/ProductCard";
import * as productServices from "@/services/product";
import * as variationServices from "@/services/variation";
import useDataFetch from "@/hooks/use-data-fetch";
import { addToCart } from "@/store/slices/cartSlice";
import { setBuyNowItem } from "@/store/slices/buyNowSlice";
import { toast } from "sonner";
import CartToast from "@/app/components/CartToast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getPromotionForProduct } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PromotionDetails } from "@/types/domains/promotion";

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
    const dispatch = useAppDispatch();
    const router = useRouter();

    const getProductByIdFetch = useDataFetch(productServices.getProductById);
    const getAllProductsFetch = useDataFetch(productServices.getAllProducts);
    const getAllVariationsFetch = useDataFetch(variationServices.getAllVariations);

    const [product, setProduct] = useState<Product | null>(null);
    const [variations, setVariations] = useState<{ [variationId: number]: Omit<Variation, "variationOptions"> }>({});
    const [activeImage, setActiveImage] = useState<ProductImage | null>(null);

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
                const variationName = variations[opt.variationId]?.name || `Variation ${opt.variationId}`;
                const variation = acc[opt.variationId] = acc[opt.variationId] ?? {
                    variationName: variationName,
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
    }, [product, variations]);

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

    // Fetch product data
    useEffect(() => {
        if (productId) {
            getProductByIdFetch.request(Number(productId))
                .onSuccess((data: ProductDetails) => {
                    // Transform ProductDetails to match expected format
                    const transformedProduct: any = {
                        ...data,
                        productImages: data.images,
                        variants: data.variants.map(variant => ({
                            ...variant,
                            variationOptions: Object.entries(variant.variantProperties).map(([variationId, prop]) => ({
                                variationId: Number(variationId),
                                variationOptionId: prop.variationOptionId,
                                name: prop.name
                            }))
                        }))
                    };

                    setProduct(transformedProduct);

                    // Set default active image
                    const defaultImg = transformedProduct.productImages?.find((img: ProductImage) => img.isDefault) ?? transformedProduct.productImages?.[0];
                    if (defaultImg) setActiveImage(defaultImg);

                    // Fetch variations for this product's category
                    getAllVariationsFetch.request(data.categoryId)
                        .onSuccess((variationsData: Variation[]) => {
                            const variationMap = variationsData.reduce((acc, variation) => {
                                acc[variation.variationId] = {
                                    variationId: variation.variationId,
                                    name: variation.name
                                };
                                return acc;
                            }, {} as { [variationId: number]: Omit<Variation, "variationOptions"> });
                            setVariations(variationMap);
                        });

                    // Fetch related products from same category
                    getAllProductsFetch.request({ categoryId: data.categoryId, status: true });
                });
        }
    }, [productId]);

    useEffect(() => {
        if (product) {
            setVariantSelectionState(initializeVariantSelectionState());
        }
    }, [product, variations, initializeVariantSelectionState]);

    // Set active image when product changes
    useEffect(() => {
        if (product?.productImages?.length && !activeImage) {
            const defaultImg = product.productImages.find((img: ProductImage) => img.isDefault) ?? product.productImages[0];
            if (defaultImg) setActiveImage(defaultImg);
        }
    }, [product, activeImage]);



    const { user, authenticated } = useAppSelector(state => state.auth);
    const isCustomer = user?.roleName === UserRole.CUSTOMER;
    const currentCustomerId = isCustomer ? user?.userId : undefined;
    const promotions = useAppSelector((state) => state.promotions.items);

    // Helper function to calculate discounted price
    const calculateDiscountedPrice = useCallback((price: number, promo: PromotionDetails | null): number => {
        if (!promo) return price;
        if (promo.promotionType === "PERCENTAGE") {
            return price * (1 - promo.discountValue / 100);
        }
        return Math.max(price - promo.discountValue, 0);
    }, []);

    // Get promotion for this product
    const productPromo = useMemo(() => {
        if (!product?.categoryId) return null;
        const productPreview = {
            productId: product.productId,
            productVariantId: product.variants[0]?.productVariantId || 0,
            categoryId: product.categoryId,
            price: priceRange[0],
            title: product.title,
            code: product.code,
            rating: 0,
            starred: product.starred,
            dateAdded: new Date(product.dateAdded),
            quantityInStock: product.variants[0]?.quantityInStock || 0,
            imageUrl: product.productImages[0]?.imageUrl || "",
        };
        return getPromotionForProduct(productPreview, promotions);
    }, [product, promotions, priceRange]);

    // Get selected variant
    const selectedVariant = useMemo(() => {
        if (!product?.variants?.length) return null;
        if (Object.keys(variationMap).length === 0) {
            return product.variants[0];
        }
        const allVariationsSelected = Object.values(variationMap).every(
            (variation) => variation.selectedOptionId != null
        );
        if (!allVariationsSelected) return null;
        return product.variants.find((variant) =>
            variant.variationOptions.every((opt) =>
                variationMap[opt.variationId]?.selectedOptionId === opt.variationOptionId
            )
        ) || null;
    }, [product, variationMap]);

    // Calculate total price from selected variant
    const totalPrice = useMemo(() => {
        return selectedVariant?.price ?? (priceRange[0] === priceRange[1] ? priceRange[0] : null);
    }, [selectedVariant, priceRange]);

    // Calculate discounted price
    const discountedPrice = useMemo(() => {
        if (totalPrice === null) return null;
        return calculateDiscountedPrice(totalPrice, productPromo);
    }, [totalPrice, productPromo, calculateDiscountedPrice]);

    // Calculate discounted price range (for display when no variant selected)
    const discountedPriceRange = useMemo(() => {
        if (!productPromo) return priceRange;
        return [
            calculateDiscountedPrice(priceRange[0], productPromo),
            calculateDiscountedPrice(priceRange[1], productPromo)
        ] as [number, number];
    }, [priceRange, productPromo, calculateDiscountedPrice]);

    // Find the selected variant (for use in callbacks)
    const getSelectedVariant = useCallback(() => selectedVariant, [selectedVariant]);

    // Memoize related products
    const relatedProducts = useMemo(() =>
        getAllProductsFetch.data
            ?.filter((p) => p.status !== false)
            .filter((p) => p.productId !== Number(productId))
            .slice(0, 4) ?? [],
        [getAllProductsFetch.data, productId]
    );

    // Toast configuration constant
    const cartToastConfig = useMemo(() => ({
        id: "cart-toast" as const,
        position: "bottom-left" as const,
        closeButton: false,
        style: {
            display: "block" as const,
            padding: "0px",
            width: "500px",
            height: "auto",
        },
        dismissible: false,
        duration: Infinity,
    }), []);

    // Handle add to cart logic
    const handleAddToCart = useCallback(async () => {
        if (!authenticated) {
            toast.error("Please login to add items to cart");
            const returnUrl = `/products/${productId}`;
            router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        }

        const selectedVariant = getSelectedVariant();
        if (!selectedVariant) {
            toast.error("Please select all product variations");
            return;
        }

        await dispatch(
            addToCart({
                productVariantId: selectedVariant.productVariantId,
                quantity: 1,
            })
        );

        if (!toast.getToasts().find((t) => t.id === "cart-toast")) {
            toast(CartToast, cartToastConfig);
        }
    }, [authenticated, getSelectedVariant, dispatch, router, cartToastConfig, productId]);

    // Handle buy now logic
    const handleBuyNow = useCallback(async () => {
        if (!authenticated) {
            toast.error("Please login to place an order");
            const returnUrl = `/products/${productId}`;
            router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        }

        const selectedVariant = getSelectedVariant();
        console.log("Buy Now - selectedVariant:", selectedVariant);
        console.log("Buy Now - variationMap:", variationMap);

        if (!selectedVariant) {
            toast.error("Please select all product variations");
            return;
        }

        // Build a temporary CartItemPreview WITHOUT touching the shared cart
        const buyNowItem = {
            cartItemId: -1, // sentinel value — not a real cart item
            productVariantId: selectedVariant.productVariantId,
            title: product?.title ?? "",
            sku: selectedVariant.sku ?? "",
            price: selectedVariant.price,
            quantity: 1,
            quantityInStock: selectedVariant.quantityInStock ?? 99,
            imageUrl: activeImage?.imageUrl ?? product?.productImages?.[0]?.imageUrl,
            addedAt: new Date(),
        };

        console.log("Buy Now - dispatching buyNowItem:", buyNowItem);
        dispatch(setBuyNowItem(buyNowItem));
        router.push("/checkout?mode=buynow");
    }, [authenticated, getSelectedVariant, variationMap, dispatch, router, productId, product, activeImage]);

    // Loading state
    if (getProductByIdFetch.isLoading) {
        return (
            <div className="responsive-container">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (getProductByIdFetch.hasError || !product) {
        return (
            <div className="responsive-container">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                        <p className="text-muted-foreground mb-4">{"The product you're looking for doesn't exist."}</p>
                        <Button onClick={() => window.history.back()}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="responsive-container">
            <div className="relative p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div>
                    <div className="border rounded-md overflow-hidden h-96 md:h-[500px]">
                        {product?.productImages && product.productImages.length > 0 ? (
                            <Image
                                src={activeImage?.imageUrl || product.productImages[0]?.imageUrl}
                                alt={product.title}
                                width={100}
                                height={100}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                quality={95}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                                <p className="text-muted-foreground">No images available</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex gap-3">
                        {product?.productImages?.map((img, index) => (
                            <button
                                key={img.productImageId}
                                onClick={() => setActiveImage(img)}
                                className={`rounded-md overflow-hidden p-0 w-35 h-35 ${activeImage?.productImageId === img.productImageId ? "border-black border-3 z-10" : "border-mute"}`}
                            >
                                <Image
                                    src={img.imageUrl}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={100}
                                    height={100}
                                    sizes="100px"
                                    quality={90}
                                    className="w-full h-full object-cover"
                                />
                            </button>
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
                                                const isSelected = value.selectedOptionId === Number(optKey);
                                                if (isSelected) {
                                                    return (
                                                        <SelectItem key={optKey} value={String(optKey)}>
                                                            {optValue.name}
                                                        </SelectItem>
                                                    );
                                                }

                                                const [lowerPrice, upperPrice] = optValue.priceRange;
                                                const discountedLower = calculateDiscountedPrice(lowerPrice, productPromo);
                                                const discountedUpper = calculateDiscountedPrice(upperPrice, productPromo);

                                                const lowerValue = lowerPrice.toFixed(2);
                                                const upperValue = upperPrice.toFixed(2);
                                                const discLower = discountedLower.toFixed(2);
                                                const discUpper = discountedUpper.toFixed(2);

                                                const isSinglePrice = lowerPrice === upperPrice;
                                                const isSingleDiscounted = discountedLower === discountedUpper;

                                                return (
                                                    <SelectItem key={optKey} value={String(optKey)}>
                                                        <span className="flex items-center gap-2">
                                                            <span>{optValue.name}</span>
                                                            {productPromo ? (
                                                                <span className="text-xs">
                                                                    <span className="text-primary font-semibold">
                                                                        {isSingleDiscounted
                                                                            ? `$${discLower}`
                                                                            : `$${discLower} - $${discUpper}`}
                                                                    </span>
                                                                    <span className="text-muted-foreground line-through ml-1">
                                                                        {isSinglePrice
                                                                            ? `$${lowerValue}`
                                                                            : `$${lowerValue} - $${upperValue}`}
                                                                    </span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs">
                                                                    {isSinglePrice
                                                                        ? `$${lowerValue}`
                                                                        : `$${lowerValue} - $${upperValue}`}
                                                                </span>
                                                            )}
                                                        </span>
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
                    <div className="space-y-2">
                        {productPromo && (
                            <Badge variant="default" className="bg-primary text-primary-foreground">
                                {productPromo.promotionType === "PERCENTAGE"
                                    ? `${productPromo.discountValue}% OFF`
                                    : `$${productPromo.discountValue} OFF`}
                            </Badge>
                        )}
                        <div className="flex items-center gap-3">
                            {selectedVariant && totalPrice !== null ? (
                                <>
                                    <div className="text-lg font-semibold text-primary">
                                        ${(discountedPrice ?? totalPrice).toFixed(2)}
                                    </div>
                                    {productPromo && discountedPrice !== null && discountedPrice !== totalPrice && (
                                        <div className="text-sm text-muted-foreground line-through">
                                            ${totalPrice.toFixed(2)}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-lg font-semibold text-primary">
                                        {discountedPriceRange[0] === discountedPriceRange[1]
                                            ? `$${discountedPriceRange[0].toFixed(2)}`
                                            : `$${discountedPriceRange[0].toFixed(2)} - $${discountedPriceRange[1].toFixed(2)}`}
                                    </div>
                                    {productPromo && (
                                        <div className="text-sm text-muted-foreground line-through">
                                            {priceRange[0] === priceRange[1]
                                                ? `$${priceRange[0].toFixed(2)}`
                                                : `$${priceRange[0].toFixed(2)} - $${priceRange[1].toFixed(2)}`}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="border w-full rounded-md p-4">
                        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Secure Payment</p>
                        <div className="flex items-center justify-center">
                            <img
                                src="/iyzico-logo-pack/iyzico-logo-pack/footer_iyzico_ile_ode/Colored/logo_band_colored.svg"
                                alt="iyzico ile öde - güvenli ödeme"
                                className="h-10 object-contain"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full"
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </Button>
                    </div>

                    <h1 className="text-2xl font-bold"> Description </h1>
                    <p className="text-muted-foreground">{product?.description}</p>

                </div>
            </div>
            <div className="mt-12 px-6 pb-8">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-8">Related Products</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getAllProductsFetch.isLoading ? (
                        <div className="col-span-full text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading related products...</p>
                        </div>
                    ) : relatedProducts.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">No related products found</p>
                        </div>
                    ) : (
                        relatedProducts.map((relatedProduct) => {
                            const promo = getPromotionForProduct(relatedProduct, promotions);
                            return (
                                <ProductCard
                                    key={relatedProduct.productId}
                                    product={relatedProduct}
                                    promo={promo}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    )
};
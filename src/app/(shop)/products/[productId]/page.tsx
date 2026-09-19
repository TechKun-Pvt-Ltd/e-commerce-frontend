/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Product, ProductDetails as ProductDetailsType, ProductImage } from "@/types/domains/product"
import { Button } from "@/components/ui/button"
import { Variation } from "@/types/domains/variation";
import { CategoryDetails } from "@/types/domains/category";
import { ProductReviews } from "../Components/ProductReviews";
import { ProductQA } from "../Components/ProductQA";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import ProductCard from "@/app/components/ProductCard";
import * as productServices from "@/services/product";
import * as variationServices from "@/services/variation";
import * as categoryServices from "@/services/category";
import * as shippingMethodServices from "@/services/shippingMethod";
import useDataFetch from "@/hooks/use-data-fetch";
import { addToCart } from "@/store/slices/cartSlice";
import { setBuyNowItem } from "@/store/slices/buyNowSlice";
import { toast } from "sonner";
import CartToast from "@/app/components/CartToast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPromotionForProduct, cn } from "@/lib/utils";
import { PromotionDetails } from "@/types/domains/promotion";
import { ChevronRight, Home, Heart, Truck } from "lucide-react";
import { Rating, RatingButton } from "@/components/ui/rating";
import { addToWishlistAsync, removeFromWishlistAsync } from "@/store/slices/wishlistSlice";
import ErrorBoundary from "@/components/ErrorBoundary";

// Sub-components
import { ProductGallery } from "./components/ProductGallery";
import { PriceBlock } from "./components/PriceBlock";
import { ProductDetails as ProductDetailsSection } from "./components/ProductDetails";
import { ActionButtons } from "./components/ActionButtons";
import { MobileStickyBar } from "./components/MobileStickyBar";
import { VariationSelector } from "./components/VariationSelector";

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

function buildCategoryPath(cat: CategoryDetails): { id: number; name: string }[] {
    const path: { id: number; name: string }[] = [];
    let current: CategoryDetails | undefined = cat;
    while (current) {
        path.unshift({ id: current.categoryId, name: current.name });
        current = current.parentCategory;
    }
    return path;
}

const GENERIC_PRODUCT_DETAILS = [
    { key: "SIZE",      value: "Please check variations for large wall painting on canvas for home decoration." },
    { key: "MATERIAL",  value: "Cotton canvas streched on wooden bars for long life." },
    { key: "USAGE",     value: "Decorate your walls in style and luxury with our big size paintings for living room walls, bedroom furnishing or adorn your office reception area or boss cabin wall." },
    { key: "MATERIALS", value: "Good quality canvas printed to last for years to come, non fading. Stretched on real wood to make a complete framed art piece." },
    { key: "DETAILS",   value: "Make a bold statement with this exquisite painting, designed to enhance the ambiance of any room. Made from the finest materials, it showcases rich, vibrant colors that are both eye-catching and long-lasting. Perfect for home or office use, it brings a touch of elegance to any space, from living rooms to hotel lobbies." },
];

function LoadingSkeleton() {
    return (
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-6">
            <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                        {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                    <div className="h-96 md:h-[500px] bg-muted animate-pulse rounded-md" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 w-20 bg-muted animate-pulse rounded-md" />)}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                    <div className="space-y-2">
                        {[1, 2].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
                    </div>
                    <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
                    <div className="space-y-3">
                        <div className="h-12 bg-muted animate-pulse rounded" />
                        <div className="h-12 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = React.use(params);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const getProductByIdFetch = useDataFetch(productServices.getProductById);
    const getAllProductsFetch = useDataFetch(productServices.getAllProducts);
    const getAllVariationsFetch = useDataFetch(variationServices.getAllVariations);
    const getCategoryByIdFetch = useDataFetch(categoryServices.getCategoryById);
    const getShippingMethodFetch = useDataFetch(shippingMethodServices.getShippingMethodByVariantId);

    const [product, setProduct] = useState<Product | null>(null);
    const [productRating, setProductRating] = useState<{ averageRating: number; reviewCount: number }>({ averageRating: 0, reviewCount: 0 });
    const [variations, setVariations] = useState<{ [variationId: number]: Omit<Variation, "variationOptions"> }>({});
    const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
    const [categoryPath, setCategoryPath] = useState<{ id: number; name: string }[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [attrsExpanded, setAttrsExpanded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    const [{ priceRange, variationMap }, setVariantSelectionState] = useState<VariantSelectionState>({
        priceRange: [0, 0],
        variationMap: {},
    });

    const initializeVariantSelectionState = useCallback((): VariantSelectionState => {
        const initialPriceRange: [number, number] = [Infinity, -Infinity];
        const initialVariationMap = (product?.variants || []).filter(v => !v.disabled).reduce((acc, cur) => {
            initialPriceRange[0] = Math.min(initialPriceRange[0], cur.price);
            initialPriceRange[1] = Math.max(initialPriceRange[1], cur.price);

            cur.variationOptions.forEach(opt => {
                const variationName = variations[opt.variationId]?.name || `Variation ${opt.variationId}`;
                const variation = acc[opt.variationId] = acc[opt.variationId] ?? { variationName, options: {} };
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

        return { priceRange: initialPriceRange, variationMap: initialVariationMap };
    }, [product, variations]);

    const onSelectVariation = useCallback((variationId: number, optionId: number) => {
        setAttemptedSubmit(false);
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

            const newVariationMap = (product?.variants || []).filter(v => !v.disabled)
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

                    currentVariant.variationOptions.forEach(opt => {
                        if (!variantOptionsIncluded[opt.variationOptionId]) return;

                        const variation = newVarMap[opt.variationId] = opt.variationId in newVarMap ?
                            newVarMap[opt.variationId] : { ...currentVarMap[opt.variationId], options: {} };
                        if (opt.variationOptionId in variation.options) {
                            const variationOption = variation.options[opt.variationOptionId];
                            variationOption.priceRange[0] = Math.min(variationOption.priceRange[0], currentVariant.price);
                            variationOption.priceRange[1] = Math.max(variationOption.priceRange[1], currentVariant.price);
                        } else {
                            variation.options[opt.variationOptionId] = {
                                name: opt.name,
                                priceRange: [currentVariant.price, currentVariant.price]
                            };
                        }
                    });

                    return newVarMap;
                }, {} as VariationMap);

            return { priceRange: newPriceRange, variationMap: newVariationMap };
        });
    }, [product]);

    // buildCategoryPath is defined at module level

    // Fetch product data
    useEffect(() => {
        if (productId) {
            getProductByIdFetch.request(Number(productId))
                .onSuccess((data: ProductDetailsType) => {
                    const transformedProduct = {
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
                    } as unknown as Product;

                    setProduct(transformedProduct);
                    setProductRating({
                        averageRating: data.averageRating ?? 0,
                        reviewCount: data.reviewCount ?? 0,
                    });

                    const defaultImg = transformedProduct.productImages?.find((img: ProductImage) => img.isDefault) ?? transformedProduct.productImages?.[0];
                    if (defaultImg) setActiveImage(defaultImg);

                    // Fire variations, related products, and category in parallel
                    getAllVariationsFetch.request(data.categoryId)
                        .onSuccess((variationsData: Variation[]) => {
                            const variationMapData = variationsData.reduce((acc, variation) => {
                                acc[variation.variationId] = { variationId: variation.variationId, name: variation.name };
                                return acc;
                            }, {} as { [variationId: number]: Omit<Variation, "variationOptions"> });
                            setVariations(variationMapData);
                        });

                    getAllProductsFetch.request({ categoryId: data.categoryId, status: true, limit: 4, excludeProductId: data.productId });

                    getCategoryByIdFetch.request(data.categoryId)
                        .onSuccess((cat: CategoryDetails) => {
                            setCategoryPath(buildCategoryPath(cat));
                        });
                });
        }
    }, [productId]);

    useEffect(() => {
        if (product) {
            setVariantSelectionState(initializeVariantSelectionState());
        }
    }, [product, variations, initializeVariantSelectionState]);

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

    const calculateDiscountedPrice = useCallback((price: number, promo: PromotionDetails | null): number => {
        if (!promo) return price;
        if (promo.promotionType === "PERCENTAGE") {
            return price * (1 - promo.discountValue / 100);
        }
        return Math.max(price - promo.discountValue, 0);
    }, []);

    const productPromo = useMemo(() => {
        if (!product?.categoryId) return null;
        const productPreview = {
            productId: product.productId,
            productVariantId: product.variants[0]?.productVariantId || 0,
            categoryId: product.categoryId,
            price: priceRange[0],
            title: product.title,
            code: product.code,
            rating: productRating.averageRating,
            starred: product.starred,
            dateAdded: new Date(product.dateAdded),
            quantityInStock: product.variants[0]?.quantityInStock || 0,
            imageUrl: product.productImages[0]?.imageUrl || "",
            images: product.productImages.map(img => img.imageUrl),
        };
        return getPromotionForProduct(productPreview, promotions);
    }, [product, promotions, priceRange, productRating]);

    const enabledVariants = useMemo(() => product?.variants.filter(v => !v.disabled) ?? [], [product]);

    const selectedVariant = useMemo(() => {
        if (!enabledVariants.length) return null;
        if (Object.keys(variationMap).length === 0) return enabledVariants[0];
        const allVariationsSelected = Object.values(variationMap).every(v => v.selectedOptionId != null);
        if (!allVariationsSelected) return null;
        return enabledVariants.find(variant =>
            variant.variationOptions.every(opt =>
                variationMap[opt.variationId]?.selectedOptionId === opt.variationOptionId
            )
        ) || null;
    }, [enabledVariants, variationMap]);

    useEffect(() => { setQuantity(1); }, [selectedVariant?.productVariantId]);

    const shippingVariantId = selectedVariant?.productVariantId ?? enabledVariants[0]?.productVariantId;
    useEffect(() => {
        if (shippingVariantId) {
            getShippingMethodFetch.request(shippingVariantId);
        }
    }, [shippingVariantId]);

    const totalPrice = useMemo(() => {
        return selectedVariant?.price ?? (priceRange[0] === priceRange[1] ? priceRange[0] : null);
    }, [selectedVariant, priceRange]);

    const discountedPrice = useMemo(() => {
        if (totalPrice === null) return null;
        return calculateDiscountedPrice(totalPrice, productPromo);
    }, [totalPrice, productPromo, calculateDiscountedPrice]);

    const discountedPriceRange = useMemo(() => {
        if (!productPromo) return priceRange;
        return [
            calculateDiscountedPrice(priceRange[0], productPromo),
            calculateDiscountedPrice(priceRange[1], productPromo)
        ] as [number, number];
    }, [priceRange, productPromo, calculateDiscountedPrice]);

    const relatedProducts = useMemo(() => getAllProductsFetch.data ?? [], [getAllProductsFetch.data]);

    const stockStatus = useMemo(() => {
        const qty = selectedVariant?.quantityInStock ?? enabledVariants.reduce((sum, v) => sum + v.quantityInStock, 0);
        if (qty === 0) return { label: "Out of Stock", color: "text-destructive" };
        if (qty <= 5) return { label: `Only ${qty} left!`, color: "text-amber-500" };
        return { label: "In Stock", color: "text-green-600" };
    }, [selectedVariant, enabledVariants]);

    const isOutOfStock = stockStatus.label === "Out of Stock";
    const maxQty = selectedVariant?.quantityInStock ?? 99;

    const cartToastConfig = useMemo(() => ({
        id: "cart-toast" as const,
        position: "bottom-left" as const,
        closeButton: false,
        style: {
            display: "block" as const,
            padding: "0px",
            width: "min(500px, calc(100vw - 24px))",
            maxWidth: "500px",
            height: "auto",
        },
        dismissible: false,
        duration: Infinity,
    }), []);

    const handleAddToCart = useCallback(async () => {
        const variant = selectedVariant;
        if (!variant) {
            setAttemptedSubmit(true);
            toast.error("Please select all product options");
            return;
        }
        if (variant.quantityInStock !== undefined && variant.quantityInStock <= 0) {
            toast.error("This product variant is currently out of stock.");
            return;
        }
        setIsAddingToCart(true);
        try {
            const imageId = activeImage?.productImageId ?? product?.productImages?.[0]?.productImageId;
            await dispatch(addToCart({
                productVariantId: variant.productVariantId,
                quantity,
                productImageId: imageId,
                title: product?.title ?? "Canvas Wall Art",
                sku: variant.sku ?? "",
                price: variant.price,
                imageUrl: activeImage?.imageUrl ?? product?.productImages?.[0]?.imageUrl,
                quantityInStock: variant.quantityInStock ?? 99
            }));
            if (!toast.getToasts().find((t) => t.id === "cart-toast")) {
                toast(CartToast, cartToastConfig);
            }
        } finally {
            setIsAddingToCart(false);
        }
    }, [selectedVariant, dispatch, cartToastConfig, activeImage, product, quantity]);

    const handleBuyNow = useCallback(async () => {
        const variant = selectedVariant;
        if (!variant) {
            setAttemptedSubmit(true);
            toast.error("Please select all product options");
            return;
        }
        if (variant.quantityInStock !== undefined && variant.quantityInStock <= 0) {
            toast.error("This product variant is currently out of stock.");
            return;
        }
        setIsBuyingNow(true);
        dispatch(setBuyNowItem({
            cartItemId: -1,
            addedAt: new Date(),
            productVariantId: variant.productVariantId,
            title: product?.title ?? "",
            sku: variant.sku ?? "",
            price: variant.price,
            quantity,
            quantityInStock: variant.quantityInStock ?? 99,
            imageUrl: activeImage?.imageUrl ?? product?.productImages?.[0]?.imageUrl,
        }));
        router.push('/checkout?mode=buynow');
        setIsBuyingNow(false);
    }, [authenticated, selectedVariant, dispatch, router, activeImage, product, quantity]);

    // Wishlist
    const wishlistItems = useAppSelector(state => state.wishlist.items);
    const wishlistEntry = wishlistItems.find(item =>
        product?.variants.some(v => v.productVariantId === item.productVariant.productVariantId)
    );
    const isInWishlist = !!wishlistEntry;
    const wishlistVariantId = selectedVariant?.productVariantId ?? enabledVariants[0]?.productVariantId;

    const handleWishlistToggle = useCallback(async () => {
        if (!authenticated) {
            toast.error("Please login to add items to wishlist");
            return;
        }
        if (isInWishlist && wishlistEntry?.wishlistItemId) {
            await dispatch(removeFromWishlistAsync(wishlistEntry.wishlistItemId));
            toast.success("Removed from wishlist");
        } else if (wishlistVariantId) {
            await dispatch(addToWishlistAsync(wishlistVariantId));
            toast.success("Added to wishlist");
        }
    }, [authenticated, isInWishlist, wishlistEntry, wishlistVariantId, dispatch]);

    const normalizeVariationName = (name: string): string => {
        if (/^\d+[:/]\d+/.test(name.trim()) || /frame\s*rate/i.test(name)) return 'Size';
        return name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const hasVariations = Object.keys(variationMap).length > 0;
    const allVariationsSelected = hasVariations
        ? Object.values(variationMap).every(v => v.selectedOptionId != null)
        : true;

    // Loading skeleton
    if (getProductByIdFetch.isLoading) return <LoadingSkeleton />;

    if (getProductByIdFetch.hasError || !product) {
        return (
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10">
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
        <ErrorBoundary>
        <>
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground py-4 flex-wrap">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    <span>Home</span>
                </Link>
                {categoryPath.map((crumb) => (
                    <React.Fragment key={crumb.id}>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        <Link
                            href={`/products?categoryId=${crumb.id}`}
                            className="hover:text-foreground transition-colors truncate max-w-[160px]"
                        >
                            {crumb.name}
                        </Link>
                    </React.Fragment>
                ))}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
            </nav>

            {/* Hero — 2-column layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-2 pb-6">

                {/* Left — Image gallery (extracted component) */}
                <ErrorBoundary>
                    <ProductGallery
                        product={product}
                        activeImage={activeImage}
                        onImageChange={setActiveImage}
                        priority
                    />
                </ErrorBoundary>

                {/* Right — Product info */}
                <div className="min-w-0 space-y-5 lg:pr-4">

                    {/* Title + wishlist */}
                    <div>
                        <div className="flex items-start gap-3">
                            <h1 className="font-display text-3xl font-semibold leading-snug flex-1">{product.title}</h1>
                            <button
                                type="button"
                                onClick={handleWishlistToggle}
                                className="shrink-0 mt-0.5 p-1.5 rounded-full hover:bg-muted transition-colors"
                                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart className={cn("h-5 w-5 transition-colors", isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                            </button>
                        </div>
                        {productRating.reviewCount > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <Rating readOnly value={Math.round(productRating.averageRating)} className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <RatingButton key={i} />
                                    ))}
                                </Rating>
                                <span className="text-sm text-muted-foreground">
                                    {productRating.averageRating.toFixed(1)} ({productRating.reviewCount} {productRating.reviewCount === 1 ? "review" : "reviews"})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Variation dropdowns */}
                    {hasVariations && (
                        <>
                        <VariationSelector
                            variationMap={variationMap}
                            productPromo={productPromo}
                            onSelectVariation={onSelectVariation}
                            attemptedSubmit={attemptedSubmit}
                            calculateDiscountedPrice={calculateDiscountedPrice}
                            normalizeVariationName={normalizeVariationName}
                        />
                        {!allVariationsSelected && (
                            <p className="text-xs text-muted-foreground">Select all options to see exact price and availability.</p>
                        )}
                        </>
                    )}

                    {/* Price block (extracted component) */}
                    <PriceBlock
                        product={product}
                        selectedVariant={selectedVariant}
                        priceRange={priceRange}
                        productPromo={productPromo}
                        stockStatus={stockStatus}
                        isOutOfStock={isOutOfStock}
                        calculateDiscountedPrice={calculateDiscountedPrice}
                    />

                    {/* Quantity selector */}
                    {!isOutOfStock && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Qty</span>
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="h-9 w-9 flex items-center justify-center text-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className="h-9 w-10 flex items-center justify-center text-sm font-medium border-x select-none">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                    disabled={quantity >= maxQty}
                                    className="h-9 w-9 flex items-center justify-center text-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                            {maxQty <= 10 && (
                                <span className="text-xs text-muted-foreground">{maxQty} available</span>
                            )}
                        </div>
                    )}

                    {/* Action buttons (extracted component) */}
                    <ActionButtons
                        isOutOfStock={isOutOfStock}
                        isAddingToCart={isAddingToCart}
                        isBuyingNow={isBuyingNow}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                    />

                    {/* Secure checkout badge */}
                    <div className="flex items-center gap-2 border rounded-lg px-4 py-2.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Secure checkout</span>
                        <div className="flex-1 flex justify-end">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/iyzico-logo-pack/iyzico-logo-pack/footer_iyzico_ile_ode/Colored/logo_band_colored.svg"
                                alt="iyzico ile öde - güvenli ödeme"
                                className="h-7 object-contain"
                            />
                        </div>
                    </div>

                    {/* Shipping & Delivery */}
                    {getShippingMethodFetch.data && (
                        <div className="border rounded-lg px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm font-medium">{getShippingMethodFetch.data.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                                Processing: {getShippingMethodFetch.data.processingTimeMin}–{getShippingMethodFetch.data.processingTimeMax} business days
                            </p>
                            {getShippingMethodFetch.data.shippingOptions.length > 0 && (
                                <div className="pl-6 space-y-1">
                                    {getShippingMethodFetch.data.shippingOptions.slice(0, 2).map((opt, i) => (
                                        <p key={i} className="text-xs text-muted-foreground">
                                            {opt.carrier} · {opt.destinationCountry} · {opt.estimatedDeliveryMin}–{opt.estimatedDeliveryMax} days · ${opt.costFirstItem.toFixed(2)}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Product details table (extracted component) */}
                    <ProductDetailsSection
                        product={product}
                        variationMap={variationMap}
                        categoryPath={categoryPath}
                        attrsExpanded={attrsExpanded}
                        setAttrsExpanded={setAttrsExpanded}
                    />

                    {/* Description */}
                    <div>
                        <p className="text-base font-semibold text-foreground mb-3">Description</p>
                        <ul className="space-y-2">
                            {GENERIC_PRODUCT_DETAILS.map((item) => (
                                <li key={item.key} className="flex gap-2 text-sm leading-relaxed">
                                    <span className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    <span className="text-muted-foreground">
                                        <span className="font-medium text-foreground">{item.key}: </span>
                                        {item.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <div className="mb-10">
                <ErrorBoundary>
                    <ProductReviews
                        productId={Number(productId)}
                        currentCustomerId={currentCustomerId}
                        serverAverageRating={productRating.averageRating}
                        serverReviewCount={productRating.reviewCount}
                    />
                </ErrorBoundary>
            </div>

            {/* FAQ */}
            <div className="mb-10">
                <ErrorBoundary>
                    <ProductQA productId={Number(productId)} />
                </ErrorBoundary>
            </div>

            {/* Related Products */}
            <div className="pb-24 md:pb-8">
                <h2 className="font-display text-2xl md:text-3xl text-center font-semibold mb-6 tracking-wide">Related Products</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                    {getAllProductsFetch.isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                        ))
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

        {/* Mobile sticky bottom bar (extracted component) */}
        <MobileStickyBar
            product={product}
            selectedVariant={selectedVariant}
            enabledVariants={enabledVariants}
            activeImage={activeImage}
            totalPrice={totalPrice}
            discountedPrice={discountedPrice}
            isOutOfStock={isOutOfStock}
            priceRange={priceRange}
            discountedPriceRange={discountedPriceRange}
            productPromo={productPromo}
            isAddingToCart={isAddingToCart}
            isBuyingNow={isBuyingNow}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
        />
        </>
        </ErrorBoundary>
    );
}
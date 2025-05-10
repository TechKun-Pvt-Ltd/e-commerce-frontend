// components/FeaturedByCategorySection.tsx
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { CategoryTree } from "@/types/domains/category"

export interface CategoryDetails {
    categoryId: number
    name: string
}

export interface PromotionDetails {
    promotionId: number
    description: string
    promotionType: "PERCENTAGE" | "FIXED"
    discountValue: number
    categories: { categoryId: number; name: string }[]
}

export interface ProductPreview {
    productId: number
    productVariantId: number
    categoryId: number
    dateAdded: string
    quantityInStock: number
    imageUrl: string
    price: number
    title: string
    rating: number
    starred: boolean
}

interface FeaturedByCategoryProps {
    categories: CategoryTree[]
    products: ProductPreview[]
    promotions: PromotionDetails[]
}

function getPromotionForCategory(
    categoryId: number,
    promotions: PromotionDetails[]
): PromotionDetails | null {
    return promotions.find((promo) =>
        promo.categories.some((c) => c.categoryId === categoryId)
    ) || null
}

function getDiscountedPrice(
    price: number,
    promotion: PromotionDetails | null
): number {
    if (!promotion) return price
    if (promotion.promotionType === "PERCENTAGE") {
        return price - price * (promotion.discountValue / 100)
    } else if (promotion.promotionType === "FIXED") {
        return Math.max(price - promotion.discountValue, 0)
    }
    return price
}

function getProductsForCategory(
    category: CategoryTree, products: ProductPreview[], categoryProducts: ProductPreview[]
) {
    products.forEach(p =>
        p.categoryId === category.categoryId && categoryProducts.push(p)
    );
    for (const subcategory of category.subcategories)
        getProductsForCategory(subcategory, products, categoryProducts);
};

export default function FeaturedByCategory({
    categories,
    products,
    promotions,
}: FeaturedByCategoryProps) {
    return (
        <section className="space-y-12 py-12 px-4">
            {categories.map((category) => {
                const categoryProducts: ProductPreview[] = [];
                getProductsForCategory(category, products, categoryProducts);

                if (categoryProducts.length === 0) return null

                const promo = getPromotionForCategory(category.categoryId, promotions)
                const sortedProducts = [...categoryProducts].sort(
                    (a, b) => Number(b.starred) - Number(a.starred)
                )

                return (
                    <div key={category.categoryId} className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl font-semibold">
                                    Featured in {category.name}
                                </h2>
                                {promo && (
                                    <Badge variant="outline" className="w-fit text-sm">
                                        {promo.promotionType === "PERCENTAGE"
                                            ? `${promo.discountValue}% OFF`
                                            : `$${promo.discountValue} OFF`}{" "}
                                        • {promo.description}
                                    </Badge>
                                )}
                            </div>
                            <Link
                                href={`/category/${category.categoryId}`}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                View All →
                            </Link>
                        </div>

                        {/* Products */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {sortedProducts.slice(0, 6).map((product) => {
                                const discounted = getDiscountedPrice(product.price, promo)
                                return (
                                    <div
                                        key={product.productId}
                                        className="min-w-[200px] max-w-[200px] flex-shrink-0 rounded-md border p-3 shadow-sm hover:shadow-md transition"
                                    >
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.title}
                                            width={200}
                                            height={200}
                                            className="aspect-square rounded-md object-cover mb-2"
                                        />
                                        <h3 className="text-sm font-medium truncate mb-1">
                                            {product.title}
                                        </h3>
                                        <div className="text-sm mb-1">
                                            {promo && discounted < product.price ? (
                                                <>
                                                    <span className="line-through text-muted-foreground mr-1">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                    <span className="font-semibold">
                                                        ${discounted.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-semibold">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-yellow-500 mb-2">
                                            {"★".repeat(Math.round(product.rating)).padEnd(5, "☆")}
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </section>
    )
};

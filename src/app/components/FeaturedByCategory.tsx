// components/FeaturedByCategorySection.tsx
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { CategoryTree } from "@/types/domains/category"
import { ProductPreview } from "@/types/domains/product"
import { PromotionDetails } from "@/types/domains/promotion"
import ProductCard from "./ProductCard"

function getPromotionForCategory(
    categoryId: number,
    promotions: PromotionDetails[]
): PromotionDetails | null {
    return promotions.find((promo) =>
        promo.categories.some((c) => c.categoryId === categoryId)
    ) || null
};

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
    categories, products, promotions
}: {
    categories: CategoryTree[];
    products: ProductPreview[];
    promotions: PromotionDetails[];
}) {
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2">
                            {sortedProducts.slice(0, 6).map((product) => (
                                <ProductCard key={product.productId} product={product} promo={promo} />
                            ))}
                        </div>
                    </div>
                )
            })}
        </section>
    )
};

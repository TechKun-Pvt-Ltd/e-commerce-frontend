/* eslint-disable @typescript-eslint/no-unused-vars */
// components/FeaturedByCategorySection.tsx
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CategoryTree } from "@/types/domains/category"
import { ProductPreview } from "@/types/domains/product"
import { PromotionDetails } from "@/types/domains/promotion"
import ProductCard from "./ProductCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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
        <section className="px-0 sm:px-4">
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
                                {promo && (
                                    <Badge variant="outline" className="w-fit text-sm">
                                        {promo.promotionType === "PERCENTAGE"
                                            ? `${promo.discountValue}% OFF`
                                            : `$${promo.discountValue} OFF`}{" "}
                                        • {promo.description}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Products */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {/* Promo banner card */}
                            <div
                                className="relative overflow-hidden rounded-md border min-h-[220px] sm:min-h-[260px] lg:min-h-[320px] lg:col-span-1"
                                style={{ background: `url('/product-image/Ethereal.jpg') center / cover no-repeat` }}
                            >
                                <div className="absolute inset-0 bg-black/55" />
                                <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-end text-white">
                                    <h2 className="text-2xl sm:text-3xl leading-tight">
                                        <b>Discover</b>
                                        <br />
                                        BestSellers
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        className="w-32 hover:bg-white rounded-full mt-4 text-white hover:text-black border p-4 border-white"
                                    >
                                        Shop Now
                                    </Button>
                                </div>
                            </div>

                            {/* Products */}
                            {sortedProducts.slice(0, 3).map((product) => (
                                <ProductCard key={product.productId} product={product} promo={promo} />
                            ))}
                        </div>
                        {/* <div className="text-center">
                            <Link
                                href={`/category/${category.categoryId}`}>
                                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
                                    View All Plants
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div> */}
                    </div>
                )
            })}
        </section>
    )
};

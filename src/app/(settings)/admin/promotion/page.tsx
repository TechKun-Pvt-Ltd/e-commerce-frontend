"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import useDataFetch from "@/hooks/use-data-fetch";
import * as productServices from "@/services/promotion";
import CategoriesDropdown, { CategoryDropdownNode } from "@/app/components/CategoriesDropdown";
import { useAppSelector } from "@/store/hooks";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { PromotionForm } from "./component/PromotionForm";
import { PromotionDetails, PromotionDTO } from "@/types/domains/promotion";
import { toast } from "sonner";
import router from "next/router";

export default function ProductsPage() {

    const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories)
    const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownNode>();
    const promotionData = useDataFetch(productServices.getAllPromotions);
    const createPromotion = useDataFetch(productServices.createPromotion);

    useEffect(() => {
        promotionData.request();
    }, []);

    return <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
            <div className="flex justify-between items-center gap-4">
                <CategoriesDropdown selectedCategoryNode={selectedCategory} onSelect={setSelectedCategory} disabled={categoriesLoading} categories={categories} />
                {/* <Link href="/admin/products/promotion-form"><Button variant="default">Edit Promotion</Button></Link> */}
                <Dialog>
                    <PromotionForm
                        mode="create"
                        loading={createPromotion.isLoading}
                        onSubmit={data => {
                            createPromotion.request(data as PromotionDTO).onSuccess(() => {
                                  router.replace("/admin/promotions");
                            }).onError(() => {
                                toast.error("Create promotion failed");
                            });
                         }}
                    />
                </Dialog>
            </div>
        </div>
        <div className="py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(promotionData.data as PromotionDetails[])?.map((promotion, index) => (
                <div key={index} className="rounded-md border overflow-hidden shadow-sm hover:shadow-md transition relative w-full bg-white">
                    <div className="p-3 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-medium leading-tight line-clamp-2">
                                {promotion.description}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${promotion.promotionType === 'PERCENTAGE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {promotion.promotionType === "PERCENTAGE" ? "Percentage" : "Flat"}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                            <span>{promotion.promotionType === "PERCENTAGE" ? "Discount:" : "Rs."} {promotion.discountValue}{promotion.promotionType === "PERCENTAGE" ? "%" : ""}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            <span>Valid: {promotion.validFrom ? (promotion.validFrom instanceof Date ? promotion.validFrom.toLocaleDateString() : new Date(promotion.validFrom).toLocaleDateString()) : 'N/A'} - {promotion.validTill ? (promotion.validTill instanceof Date ? promotion.validTill.toLocaleDateString() : new Date(promotion.validTill).toLocaleDateString()) : 'N/A'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            <span>Min Order: {promotion.minimumOrderValue || 'N/A'}</span>
                            <span className="text-muted-foreground"> • Max Uses: {promotion.maxUses || 'Unlimited'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <span>Usage/Customer: {promotion.usagePerCustomer || 'Unlimited'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>;
}

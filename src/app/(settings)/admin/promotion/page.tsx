"use client";
import React, { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import useDataFetch from "@/hooks/use-data-fetch";
import * as productServices from "@/services/promotion";
import { PromotionForm } from "./component/PromotionForm";
import { PromotionCard } from "./component/PromotionCard";
import { PromotionDetails, PromotionDTO } from "@/types/domains/promotion";
import { toast } from "sonner";
import * as promotionServices from "@/services/promotion";

export default function ProductsPage() {
    const promotionData = useDataFetch(productServices.getAllPromotions);
    const createPromotion = useDataFetch(promotionServices.createPromotion);
    const deletePromotion = useDataFetch(promotionServices.deletePromotion);
    const updatePromotion = useDataFetch(promotionServices.updatePromotion);

    useEffect(() => {
        promotionData.request();
    }, []);
    const deletePromotionHandler = (promotionId: number) => {
        try {
            deletePromotion.request(promotionId).onSuccess(() => {
                toast.success("Promotion deleted successfully");
                promotionData.request();
            }).onError(() => {
                toast.error("Failed to delete promotion: Server error");
            });
        } catch (err) {
            toast.error("Failed to delete promotion: Unexpected error");
        }
    };
    return <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
            <div className="flex justify-between items-center gap-4">
                <Dialog>
                    <PromotionForm
                        mode="create"
                        loading={createPromotion.isLoading}
                        onSubmit={data => {
                            createPromotion.request(data as PromotionDTO).onSuccess(() => {
                                toast.success("Promotion created successfully");
                                promotionData.request(); // Refresh the list
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
                <PromotionCard
                    key={index}
                    promotion={promotion}
                    deletePromotionHandler={deletePromotionHandler}
                    updatePromotion={updatePromotion}
                    promotionData={promotionData}
                    toast={toast}
                    PromotionForm={PromotionForm}
                />
            ))}
        </div>
    </div>;
}

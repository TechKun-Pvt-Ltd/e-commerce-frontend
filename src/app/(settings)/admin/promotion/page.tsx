"use client";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useDataFetch from "@/hooks/use-data-fetch";
import * as productServices from "@/services/promotion";
import { PromotionForm } from "./component/PromotionForm";
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
                <Dialog key={index}>
                    <DialogTrigger asChild>
                        <div className="rounded-md border overflow-hidden shadow-sm hover:shadow-md transition relative w-full bg-white cursor-pointer">
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
                                <div className="text-xs text-muted-foreground mb-2">
                                    <span>Categories: {promotion.categories?.map(cat => cat.name).join(', ') || 'N/A'}</span>
                                </div>
                                <div className="text-xs text-muted-foreground flex justify-between items-center">
                                    <span>Usage/Customer: {promotion.usagePerCustomer || 'Unlimited'}</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-red-500 hover:text-red-700 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                <Trash2 size={16} />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Promotion</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete this promotion? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="mt-4">
                                                <Button variant="outline" className="cursor-pointer" onClick={() => { }}>Cancel</Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deletePromotionHandler(promotion.promotionId);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <PromotionForm
                            mode="edit"
                            loading={updatePromotion.isLoading}
                            onSubmit={data => {
                                updatePromotion.request(promotion.promotionId, data as PromotionDTO).onSuccess(() => {
                                    toast.success("Promotion updated successfully");
                                    promotionData.request(); // Refresh the list
                                }).onError(() => {
                                    toast.error("Update promotion failed");
                                });
                            }}
                            promotion={promotion}
                            showTrigger={false}
                            useDialogContent={false}
                        />
                    </DialogContent>
                </Dialog>
            ))}
        </div>
    </div>;
}

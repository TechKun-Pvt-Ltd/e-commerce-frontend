"use client";
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRef, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useDataFetch from "@/hooks/use-data-fetch";
import { PromotionForm } from "./component/PromotionForm";
import { PromotionCard, promotionCardColors } from "./component/PromotionCard";
import { PromotionDetails, PromotionDTO } from "@/types/domains/promotion";
import { toast } from "sonner";
import * as promotionServices from "@/services/promotion";
import { Button } from "@/components/ui/button";

export default function PromotionsPage() {
    const promotionData = useDataFetch(promotionServices.getAllPromotions);
    const createPromotion = useDataFetch(promotionServices.createPromotion);
    const deletePromotion = useDataFetch(promotionServices.deletePromotion);
    const updatePromotion = useDataFetch(promotionServices.updatePromotion);
    const editDialog = useRef<DialogRef>(null);
    const [targetPromotion, setTargetPromotion] = useState<PromotionDetails | null>(null);
    const deleteDialog = useRef<DialogRef>(null);
    const [deletePromotionId, setDeletePromotionId] = useState<number | null>(null);

    useEffect(() => {
        promotionData.request();
    }, []);

    return <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
            <div className="flex justify-between items-center gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Create Promotion</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader className="mb-4">
                            <DialogTitle>Create Promotion</DialogTitle>
                        </DialogHeader>
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
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <div className="py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(promotionData.data as PromotionDetails[])?.map((promotion, index) => {
                const promotionCardColorKeys = Object.keys(promotionCardColors) as (keyof typeof promotionCardColors)[];
                return <PromotionCard
                    key={index}
                    promotion={promotion}
                    onDelete={id => {
                        setDeletePromotionId(id);
                        deleteDialog.current?.open();
                    }}
                    onEdit={id => {
                        setTargetPromotion(id);
                        editDialog.current?.open();
                    }}
                    bgColor={promotionCardColorKeys[index % promotionCardColorKeys.length]}
                />
            })}
        </div>
        <Dialog ref={editDialog}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle>Edit Promotion</DialogTitle>
                </DialogHeader>
                <PromotionForm
                    mode="edit"
                    loading={updatePromotion.isLoading}
                    onSubmit={(data) => {
                        if (!targetPromotion) return;

                        updatePromotion.request(targetPromotion?.promotionId, data).onSuccess(() => {
                            toast.success("Promotion updated successfully");
                            promotionData.request(); // Refresh the list
                        }).onError(() => {
                            toast.error("Update promotion failed");
                        });
                    }}
                    promotion={targetPromotion ?? undefined}
                    showTrigger={false}
                    useDialogContent={false}
                />
            </DialogContent>
        </Dialog>
        <Dialog ref={deleteDialog}>
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
                            if (!deletePromotionId) return;

                            deletePromotion.request(deletePromotionId).onSuccess(() => {
                                toast.success("Promotion deleted successfully");
                                promotionData.request();
                            }).onError(() => {
                                toast.error("Failed to delete promotion: Server error");
                            });
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>;
}

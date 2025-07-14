"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, CreditCard } from "lucide-react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as paymentServices from "@/services/paymentMethod";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { PaymentMethodDTO, PaymentMethod } from "@/types/domains/payment_method";
import { PaymentTable } from "./component/PaymentTable";
import { PaymentForm } from "./component/PaymentForm";

export default function PaymentsPage() {
    const paymentData = useDataFetch(paymentServices.getAllPaymentMethods);
    const createPaymentMethod = useDataFetch(paymentServices.createPaymentMethod);
    const deletePaymentMethod = useDataFetch(paymentServices.deletePaymentMethod);
    const updatePaymentMethod = useDataFetch(paymentServices.updatePaymentMethod);

    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    useEffect(() => {
        paymentData.request();
    }, []);

    const handleEdit = (method: PaymentMethod) => {
        setEditingPayment(method); 
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (data: any) => {
        if (editingPayment) {
            const submitData = {
                ...data,
                disabled: data.disabled || false
            };
            updatePaymentMethod.request(editingPayment.paymentMethodId, submitData).onSuccess(() => {
                toast.success("Payment method updated successfully");
                paymentData.request();
                setIsEditDialogOpen(false);
                setEditingPayment(null);
            }).onError(() => {
                toast.error("Failed to update payment method");
            });
        }
    };

    const deletePaymentMethodHandler = (paymentMethodId: number) => {
        try {
            deletePaymentMethod.request(paymentMethodId).onSuccess(() => {
                toast.success("Payment method deleted successfully");
                paymentData.request();
                // Close any open dialogs
            }).onError(() => {
                toast.error("Failed to delete payment method: Server error");
            });
        } catch (err) {
            toast.error("Failed to delete payment method: Unexpected error");
        }
    };

    const toggleStatus = (paymentMethodId: number) => {
        const method = paymentData.data?.find((m: PaymentMethod) => m.paymentMethodId === paymentMethodId);
        if (method) {
            const updatedMethod = { 
                paymentType: method.paymentType,
                disabled: !method.disabled 
            };
            updatePaymentMethod.request(paymentMethodId, updatedMethod).onSuccess(() => {
                toast.success("Payment method status updated");
                paymentData.request();
            }).onError(() => {
                toast.error("Failed to update payment method status");
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
                <div className="flex justify-between items-center gap-4">
                    <Dialog>
                        <PaymentForm
                            mode="create"
                            loading={createPaymentMethod.isLoading}
                            onSubmit={data => {
                                const submitData = {
                                    ...data,
                                    disabled: data.disabled || false
                                };
                                createPaymentMethod.request(submitData as PaymentMethodDTO).onSuccess(() => {
                                    toast.success("Payment method created successfully");
                                    paymentData.request();
                                }).onError(() => {
                                    toast.error("Create payment method failed");
                                });
                            }}
                        />
                    </Dialog>
                </div>
            </div>

            <div className="py-2">
                <PaymentTable
                    paymentData={paymentData.data || []}
                    onEdit={handleEdit}
                    onDelete={deletePaymentMethodHandler}
                    onToggleStatus={toggleStatus}
                />
            </div>

            {/* Edit Dialog */}
            {isEditDialogOpen && editingPayment && (
                <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) {
                        setEditingPayment(null);
                    }
                }}>
                    <PaymentForm
                        mode="edit"
                        loading={updatePaymentMethod.isLoading}
                        onSubmit={handleEditSubmit}
                        paymentData={{
                            paymentType: editingPayment.paymentType,
                            disabled: editingPayment.disabled || false
                        }}
                        showTrigger={false}
                        useDialogContent={true}
                    />
                </Dialog>
            )}
        </div>
    )
}
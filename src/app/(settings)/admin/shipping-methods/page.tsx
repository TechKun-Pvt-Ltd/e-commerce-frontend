"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, CreditCard } from "lucide-react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as shippingServices from "@/services/shippingMethod";
import { ShippingForm } from './components/ShippingForm';
import { Dialog } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ShippingMethodDTO, ShippingMethod } from "@/types/domains/shipping_method";
import ShippingTable from "./components/ShippingTable";

export default function Shipping() {
  const shippingData = useDataFetch(shippingServices.getAllShippingMethods);
  const createShippingMethod = useDataFetch(shippingServices.createShippingMethod);
  const deleteShippingMethod = useDataFetch(shippingServices.deleteShippingMethod);
  const updateShippingMethod = useDataFetch(shippingServices.updateShippingMethod);

  const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    shippingData.request();
  }, []);

  const handleEdit = (method: ShippingMethod) => {
    setEditingShipping(method);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (data: any) => {
    if (editingShipping) {
      const submitData = {
        ...data,
        disabled: data.disabled || false
      };
      updateShippingMethod.request(editingShipping.shippingMethodId, submitData).onSuccess(() => {
        toast.success("Shipping method updated successfully");
        shippingData.request();
        setIsEditDialogOpen(false);
        setEditingShipping(null);
      }).onError(() => {
        toast.error("Failed to update shipping method");
      });
    }
  };

  const deleteShippingMethodHandler = (shippingMethodId: number) => {
    try {
      deleteShippingMethod.request(shippingMethodId).onSuccess(() => {
        toast.success("Shipping method deleted successfully");
        shippingData.request();
      }).onError(() => {
        toast.error("Failed to delete shipping method: Server error");
      });
    } catch (err) {
      toast.error("Failed to delete shipping method: Unexpected error");
    }
  };

  const toggleStatus = (shippingMethodId: number) => {
    const method = shippingData.data?.find((m: ShippingMethod) => m.shippingMethodId === shippingMethodId);
    if (method) {
      const updatedMethod = { ...method, disabled: !method.disabled };
      updateShippingMethod.request(shippingMethodId, updatedMethod).onSuccess(() => {
        toast.success("Shipping method status updated");
        shippingData.request();
      }).onError(() => {
        toast.error("Failed to update shipping method status");
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Methods</h1>
        <div className="flex justify-between items-center gap-4">
          <Dialog>
            <ShippingForm
              mode="create"
              loading={createShippingMethod.isLoading}
              onSubmit={data => {
                const submitData = {
                  ...data,
                  disabled: data.disabled || false
                };
                createShippingMethod.request(submitData as ShippingMethodDTO).onSuccess(() => {
                  toast.success("Shipping method created successfully");
                  shippingData.request();
                }).onError(() => {
                  toast.error("Create shipping method failed");
                });
              }}
            />
          </Dialog>
        </div>
      </div>

      <div className="py-2">
        <ShippingTable
          shippingData={shippingData.data || []}
          onEdit={handleEdit}
          onDelete={deleteShippingMethodHandler}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ShippingForm
          mode="edit"
          loading={updateShippingMethod.isLoading}
          onSubmit={handleEditSubmit}
          serviceData={editingShipping ? {
            service: editingShipping.service,
            country: editingShipping.country,
            price: editingShipping.price,
            disabled: editingShipping.disabled || false
          } : undefined}
          showTrigger={false}
          useDialogContent={true}
        />
      </Dialog>
    </div>
  );
}
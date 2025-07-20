"use client"

import useDataFetch from "@/hooks/use-data-fetch";
import * as shippingServices from "@/services/shippingMethod";
import { ShippingForm } from './components/ShippingForm';
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { ShippingMethodDTO, ShippingMethod } from "@/types/domains/shipping_method";
import ShippingTable from "./components/ShippingTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRef, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Shipping() {
  const shippingData = useDataFetch(shippingServices.getAllShippingMethods);
  const createShippingMethod = useDataFetch(shippingServices.createShippingMethod);
  const deleteShippingMethod = useDataFetch(shippingServices.deleteShippingMethod);
  const updateShippingMethod = useDataFetch(shippingServices.updateShippingMethod);

  const createDialog = useRef<DialogRef>(null);
  const editDialog = useRef<DialogRef>(null);
  const deleteDialog = useRef<DialogRef>(null);
  const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
  const [deletingShipping, setDeletingShipping] = useState<ShippingMethod | null>(null);

  useEffect(() => {
    shippingData.request();
  }, []);

  const handleEdit = (method: ShippingMethod) => {
    setEditingShipping(method);
    editDialog.current?.open();
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
        editDialog.current?.close();
        setEditingShipping(null);
      }).onError(() => {
        toast.error("Failed to update shipping method");
      });
    }
  };

  const handleDelete = (shippingMethodId: number) => {
    const method = shippingData.data?.find((m: ShippingMethod) => m.shippingMethodId === shippingMethodId);
    if (method) {
      setDeletingShipping(method);
      deleteDialog.current?.open();
    }
  };

  const confirmDelete = () => {
    if (deletingShipping) {
      deleteShippingMethod.request(deletingShipping.shippingMethodId).onSuccess(() => {
        toast.success("Shipping method deleted successfully");
        shippingData.request();
        deleteDialog.current?.close();
        setDeletingShipping(null);
      }).onError(() => {
        toast.error("Failed to delete shipping method: Server error");
      });
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
          <Button variant="default" onClick={() => createDialog.current?.open()}>
            Add Shipping Method
          </Button>
        </div>
      </div>

      <div className="py-2">
        <ShippingTable
          shippingData={shippingData.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* Create Dialog */}
      <Dialog ref={createDialog}>
        <DialogContent className="sm:max-w-[500px] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>Create Shipping Service</DialogTitle>
            <DialogDescription>
              Add a new shipping method for your store
            </DialogDescription>
          </DialogHeader>
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
                createDialog.current?.close();
              }).onError(() => {
                toast.error("Create shipping method failed");
              });
            }}
            onCancel={() => createDialog.current?.close()}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog ref={editDialog}>
        <DialogContent className="sm:max-w-[500px] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>Edit Shipping Service</DialogTitle>
            <DialogDescription>
              Update the shipping method details
            </DialogDescription>
          </DialogHeader>
          <ShippingForm
            mode="edit"
            loading={updateShippingMethod.isLoading}
            onSubmit={handleEditSubmit}
            onCancel={() => editDialog.current?.close()}
            serviceData={editingShipping ? {
              service: editingShipping.service,
              country: editingShipping.country,
              price: editingShipping.price,
              disabled: editingShipping.disabled || false
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog ref={deleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shipping Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingShipping?.service}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => deleteDialog.current?.close()}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteShippingMethod.isLoading}
            >
              {deleteShippingMethod.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
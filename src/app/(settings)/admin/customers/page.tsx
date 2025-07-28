"use client"

import useDataFetch from "@/hooks/use-data-fetch";
import * as usersServices from "@/services/user";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { ShopUser,  UserRole } from "@/types/domains/user";
import CustomerTable from "./components/CustomerTable"; // Fixed import name
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRef, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

export default function Customers() {

    const usersData = useDataFetch(usersServices.getAllUsers);
    const removeCustomer = useDataFetch(usersServices.removeUser);

 

    const deleteDialog = useRef<DialogRef>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<ShopUser | null>(null);


    const customerData = usersData.data?.filter((user: ShopUser) => 
        user.role.name === UserRole.CUSTOMER
    ) || [];

    useEffect(() => {
        usersData.request
    }, []);

    console.log("hiiiiiiiii",usersData.data)

    const handleDelete = (userId: number) => {
        const customer = customerData.find((customer: ShopUser) => customer.userId === userId);
        if (customer) {
            setDeletingCustomer(customer);
            deleteDialog.current?.open();
        }
    };

    const confirmDelete = () => {
        if (deletingCustomer) {
            removeCustomer.request({ userId: deletingCustomer.userId }).onSuccess(() => {
                toast.success("Customer removed successfully");
                usersData.request
                deleteDialog.current?.close();
                setDeletingCustomer(null);
            }).onError(() => {
                toast.error("Failed to remove Customer: Server error");
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            </div>
            <div className="py-2">
                <CustomerTable
                    shippingData={customerData} 
                    onDelete={handleDelete}
                />
            </div>
    
            <Dialog ref={deleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle> 
                        <DialogDescription>
                            Are you sure you want to remove "{deletingCustomer?.fullName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => deleteDialog.current?.close()}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={removeCustomer.isLoading}
                        >
                            {removeCustomer.isLoading ? "Removing..." : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
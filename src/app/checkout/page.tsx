"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import CheckoutForm from "./components/CheckoutForm";
import { OrderCreatePayload } from "@/types/domains/order";
import { ProductPreview } from "@/types/domains/product";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { PaymentMethod, PaymentMethodDTO } from "@/types/domains/payment_method";
import * as shippingServices from "@/services/shippingMethod";
import * as orderServices from "@/services/shopOrder";
import * as paymentServices from "@/services/paymentMethod";
import useDataFetch from "@/hooks/use-data-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function CheckoutPage() {
   const router = useRouter();
   const { items: cartItems, totalAmount, totalItems } = useAppSelector((state) => state.cart);
   const { user } = useAppSelector((state) => state.auth);
   const createOrderData = useDataFetch(orderServices.createOrder);
   const getShippingMethodByVariant = useDataFetch(shippingServices.getShippingMethodByVariantId);

   // Payment method API calls - moved from CheckoutForm
   const paymentMethodsData = useDataFetch(paymentServices.getAllPaymentMethods);
   const createPaymentMethodData = useDataFetch(paymentServices.createPaymentMethod);

   const [shippingMethods, setShippingMethods] = useState<Record<number, ShippingMethod>>({});
   const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

   useEffect(() => {
      paymentMethodsData
         .request()
         .onSuccess((data) => {
            setPaymentMethods(data || []);
         })
         .onError((error) => {
            console.error("Failed to load payment methods:", error);
            toast.error("Failed to load payment methods");
         });
      const fetchShippingMethods = async () => {
         for (const item of cartItems) {
            try {
               getShippingMethodByVariant.request(item.productVariantId).onSuccess((shippingMethod) => {
                  setShippingMethods((prev) => ({
                     ...prev,
                     [item.cartItemId]: shippingMethod,
                  }));
               });
            } catch (error) {
               console.error(`Failed to fetch shipping method for variant ${item.productVariantId}:`, error);
            }
         }
      };

      if (cartItems.length > 0) {
         fetchShippingMethods();
      }
   }, [cartItems]);

   const handleOrderSubmit = useCallback(
      (orderData: OrderCreatePayload) => {
         createOrderData
            .request(orderData)
            .onSuccess((response) => {
               toast.success("Order placed successfully!");
               router.push(`/orders/${response.orderId}`);
            })
            .onError((error) => {
               toast.error("Failed to place order. Please try again.");
               console.error("Order creation failed:", error);
            });
      },
      [createOrderData, router]
   );

   // Handle adding new payment method
   const handleAddNewPaymentMethod = useCallback(
      async (newPaymentMethod: PaymentMethodDTO): Promise<PaymentMethod> => {
         return new Promise((resolve, reject) => {
            createPaymentMethodData
               .request(newPaymentMethod)
               .onSuccess((createdMethod) => {
                  toast.success("Payment method added successfully");
                  setPaymentMethods((prev) => [...prev, createdMethod]);
                  resolve(createdMethod);
               })
               .onError((error) => {
                  console.error("Failed to create payment method:", error);
                  toast.error("Failed to add payment method");
                  reject(error);
               });
         });
      },
      [createPaymentMethodData]
   );

   return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
         <div className="container mx-auto">
            <CheckoutForm
               cartItems={cartItems}
               subtotalAmount={totalAmount}
               shippingMethods={shippingMethods}
               loading={createOrderData.isLoading}
               onSubmit={handleOrderSubmit}
               paymentMethods={paymentMethods}
               paymentMethodsLoading={paymentMethodsData.isLoading}
               createPaymentMethodLoading={createPaymentMethodData.isLoading}
               onAddPaymentMethod={handleAddNewPaymentMethod}
               currentAddress={user?.address}
            />
         </div>
      </div>
   );
}

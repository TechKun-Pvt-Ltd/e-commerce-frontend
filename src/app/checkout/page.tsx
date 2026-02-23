"use client";

import useDataFetch from "@/hooks/use-data-fetch";
import * as paymentServices from "@/services/paymentMethod";
import * as shippingServices from "@/services/shippingMethod";
import * as orderServices from "@/services/shopOrder";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { OrderCreatePayload } from "@/types/domains/order";
import { PaymentMethod, PaymentMethodDTO } from "@/types/domains/payment_method";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { toast } from "sonner";
import CheckoutForm from "./components/CheckoutForm";
import { clearBuyNowItem } from "@/store/slices/buyNowSlice";

const shippingMethodsMap: Record<number, ShippingMethod> = {};

function CheckoutPageInner() {
   const router = useRouter();
   const dispatch = useAppDispatch();
   const searchParams = useSearchParams();
   const isBuyNow = searchParams.get("mode") === "buynow";

   const { items: cartItems, totalAmount } = useAppSelector((state) => state.cart);
   const buyNowItem = useAppSelector((state) => state.buyNow.item);
   const { user } = useAppSelector((state) => state.auth);

   // If NOT a buy-now flow, clear any leftover buyNowItem from a previous session
   useEffect(() => {
      if (!isBuyNow) {
         dispatch(clearBuyNowItem());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // If Buy Now flow: use only that item; otherwise use the full cart
   // useMemo prevents a new array reference on every render (which would cause infinite useEffect loops)
   const effectiveItems = useMemo(
      () => (isBuyNow && buyNowItem ? [buyNowItem] : cartItems),
      [isBuyNow, buyNowItem, cartItems]
   );
   const effectiveTotal = useMemo(
      () => (isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalAmount),
      [isBuyNow, buyNowItem, totalAmount]
   );
   const createOrderData = useDataFetch(orderServices.createOrder);
   const getShippingMethodByVariant = useDataFetch(shippingServices.getShippingMethodByVariantId);

   // Payment method API calls - moved from CheckoutForm
   const paymentMethodsData = useDataFetch(paymentServices.getAllPaymentMethods);
   const createPaymentMethodData = useDataFetch(paymentServices.createPaymentMethod);

   const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

   useEffect(() => {
      const fetchShippingMethods = async () => {
         for (const item of effectiveItems) {
            try {
               getShippingMethodByVariant.request(item.productVariantId).onSuccess((shippingMethod) => {
                  shippingMethodsMap[item.cartItemId] = shippingMethod;
               });
            } catch (error) {
               console.error(`Failed to fetch shipping method for variant ${item.productVariantId}:`, error);
            }
         }
      };

      if (effectiveItems.length > 0) {
         fetchShippingMethods();
      }
   }, [effectiveItems]);

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
   }, []);

   const handleOrderSubmit = useCallback(
      (orderData: OrderCreatePayload) => {
         createOrderData
            .request(orderData)
            .onSuccess((response) => {
               toast.success("Order placed successfully!");
               // Clear the buy-now item after successful order
               dispatch(clearBuyNowItem());
               router.push(`/orders/${response.orderId}`);
            })
            .onError((error) => {
               toast.error("Failed to place order. Please try again.");
               console.error("Order creation failed:", error);
            });
      },
      [createOrderData, router, dispatch]
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
               cartItems={effectiveItems}
               subtotalAmount={effectiveTotal}
               shippingMethods={shippingMethodsMap}
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

export default function CheckoutPage() {
   return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" /></div>}>
         <CheckoutPageInner />
      </Suspense>
   );
}

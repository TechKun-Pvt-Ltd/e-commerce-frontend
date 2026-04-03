/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import CartItems from "./components/CartItems";
import CartSummary from "./components/CartSummary";
import ShippingCalculator from "./components/ShippingCalculator";
import OrderSuccessModal from "../checkout/components/OrderSuccessModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCartItems, updateCartItemAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CartPage = () => {
   const dispatch = useAppDispatch();
   const router = useRouter();
   const { items: cartItems, loading, error } = useAppSelector((state) => state.cart);
   const [showModal, setShowModal] = useState(false);
   const [orderId, setOrderId] = useState("");

   useEffect(() => {
      dispatch(fetchCartItems());
   }, [dispatch]);

   const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
      await dispatch(updateCartItemAsync({ cartItemId, payload: { quantity: newQuantity } }));
   };

   const handleRemoveItem = async (variantId: number) => {
      await dispatch(removeFromCartAsync(variantId));
   };

   const handleOrderPlacement = async () => {
      try {
         router.push("/checkout");
      } catch (error) {
         console.error("Order placement failed:", error);
      }
   };

   if (loading) {
      return (
          <div className="w-full flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 text-lg">Loading your cart...</p>
              </div>
          </div>
      );
   }

   if (error) {
      return <div className="text-center text-red-500 text-2xl p-10">{error}</div>;
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
         <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
               <CartItems items={cartItems} onQuantityChange={handleQuantityChange} onRemoveItem={handleRemoveItem} />
            </div>
            <div className="lg:w-1/3">
               <CartSummary items={cartItems} />
               <ShippingCalculator />
               <Link href={"/checkout"} >
                  <button
                     onClick={handleOrderPlacement}
                     className="w-full bg-black text-white py-3 px-4 rounded-lg mt-4 hover:bg-gray-800 transition-colors"
                  >
                     Proceed to Checkout
                  </button>
               </Link>
            </div>
         </div>

         <OrderSuccessModal isOpen={showModal} onClose={() => setShowModal(false)} orderId={orderId} />
      </div>
   );
};

export default CartPage;

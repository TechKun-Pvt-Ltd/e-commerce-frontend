/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAutoFreeze } from "immer";
import { getMyInformation } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { fetchCategories } from "@/store/slices/categorySlice";
import { fetchVariations } from "@/store/slices/variationSlice";
import { fetchAttributes } from "@/store/slices/attributeSlice";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clearCart, fetchCartItems } from "@/store/slices/cartSlice";
import { clearWishlist, fetchWishlistItems } from "@/store/slices/wishlistSlice";
import { fetchPromotions } from "@/store/slices/promotionSlice";

setAutoFreeze(false);

export function AppGateway({ children }: { children: React.ReactNode }) {
   const dispatch = useAppDispatch();
   const { authenticated, user, loading } = useAppSelector(state => state.auth);
   useEffect(() => {
      dispatch(getMyInformation());
      dispatch(fetchCategories());
      dispatch(fetchVariations());
      dispatch(fetchAttributes());
      dispatch(fetchPromotions());
   }, []);
   useEffect(() => {
      if (authenticated) {
         dispatch(fetchCartItems());
         dispatch(fetchWishlistItems());
      } else {
         dispatch(clearCart());
         dispatch(clearWishlist());
      }
   }, [authenticated, user]);

   return (
      <TooltipProvider delayDuration={0}>
         {loading && (
            <div className="fixed left-0 top-0 z-[9999] w-full">
               <div className="h-1 w-full overflow-hidden bg-primary/15">
                  <div className="h-full w-1/3 animate-[progress_1.1s_ease-in-out_infinite] bg-primary" />
               </div>
            </div>
         )}
         {children}
         <Toaster />
      </TooltipProvider>
   );
}

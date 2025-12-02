"use client";

import { useAppDispatch } from "@/store/hooks";
import { setAutoFreeze } from "immer";
import { getMyInformation } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { fetchCategories } from "@/store/slices/categorySlice";
import { fetchVariations } from "@/store/slices/variationSlice";
import { fetchAttributes } from "@/store/slices/attributeSlice";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fetchCartItems } from "@/store/slices/cartSlice";

setAutoFreeze(false);

export function AppGateway({ children }: { children: React.ReactNode }) {
   const dispatch = useAppDispatch();
   useEffect(() => {
      dispatch(getMyInformation());
      dispatch(fetchCategories());
      dispatch(fetchVariations());
      dispatch(fetchAttributes());
      dispatch(fetchCartItems());
   }, []);

   return (
      <TooltipProvider delayDuration={0}>
         {children}
         <Toaster />
      </TooltipProvider>
   );
}

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardContent } from "@/components/ui/card";

export default function ProductCardSkeleton() {
   return (
      <div className="w-full h-fit border overflow-hidden rounded-md bg-white p-0">
         <div className="relative aspect-square overflow-hidden">
            <Skeleton className="w-full h-full rounded-none" />
            {/* Add to Cart icon Skeleton */}
            <Skeleton className="absolute size-7 sm:size-8 rounded-full bg-muted-foreground/20 right-2 top-2 sm:top-3 z-10" />
            {/* Wishlist icon Skeleton */}
            <Skeleton className="absolute size-7 sm:size-8 rounded-full bg-muted-foreground/20 right-2 top-11 sm:top-14 z-10" />
            {/* Badge Skeleton (optional, looks good if we just assume a small badge might be there or leave it out) */}
            <Skeleton className="absolute h-5 w-16 rounded-full bg-muted-foreground/20 top-3 left-3 z-10" />
            {/* "Only X left" badge Skeleton (constrained so it won't overlap right icons on mobile) */}
            <Skeleton className="absolute h-5 w-24 max-w-[calc(100%-3.25rem)] rounded-full bg-muted-foreground/20 top-11 sm:top-12 left-2 sm:left-3 z-10" />
         </div>
         <CardContent className="p-3 sm:p-4">
            <div>
               <div className="flex items-center space-x-1 mb-1.5">
                  <div className="flex items-center gap-1">
                     {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-2.5 w-2.5 rounded-full" />
                     ))}
                  </div>
                  <Skeleton className="h-2.5 w-6 ml-1" />
               </div>
               <Skeleton className="h-3.5 sm:h-4 w-full mb-1.5" />
               <Skeleton className="h-3.5 sm:h-4 w-4/5 mb-1" />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
               <div className="flex items-center gap-2 min-w-0">
                  <Skeleton className="h-4 sm:h-5 w-16" />
                  <Skeleton className="h-3.5 sm:h-4 w-12" />
               </div>
            </div>
         </CardContent>
      </div>
   );
}

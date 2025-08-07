// // components/HeroSection.tsx
"use client";
import React from 'react';
// import Image from 'next/image';
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
// import { PromotionDetails, PromotionType } from '@/types/domains/promotion';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';

// const promotions: PromotionDetails[] = [
//     {
//         promotionId: 1,
//         description: "Up to 20% off on all Men's Clothing",
//         promotionType: PromotionType.PERCENTAGE,
//         discountValue: 20,
//         categories: [{ categoryId: 11, name: "Clothing" }],
//     },
//     {
//         promotionId: 2,
//         description: "Flat $10 off on orders above $50",
//         promotionType: PromotionType.FLAT,
//         discountValue: 10,
//         minimumOrderValue: 50,
//         categories: [{ categoryId: 21, name: "Accessories" }],
//     },
// ];

// function renderPromotionSlide(promotion: PromotionDetails) {
//     const category = promotion.categories[0]
//     const headline = promotion.promotionType === "PERCENTAGE"
//         ? `Get ${promotion.discountValue}% Off`
//         : `Save $${promotion.discountValue}`
//     const subheadline = promotion.description

//     return (
//         <CarouselItem key={promotion.promotionId}>
//             <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center">
//                 {promotion.imageUrl ? (
//                     <Image
//                         src={promotion.imageUrl}
//                         alt={promotion.description}
//                         fill
//                         className="object-cover"
//                     />
//                 ) : null}
//                 <div className="relative z-10 text-center px-4">
//                     <h2 className="text-2xl font-bold mb-2 drop-shadow-md">{headline}</h2>
//                     <p className="mb-4 drop-shadow-md">{subheadline}</p>
//                     {category && (
//                         <Link href={`/category/${category.categoryId}`}>
//                             <Button variant="secondary">Shop Now</Button>
//                         </Link>
//                     )}
//                 </div>
//             </div>
//         </CarouselItem>
//     )
// };

// const HeroSection = () => {
//     return (
//         <div className="w-full border-b bg-background">
//             <div className="mx-auto max-w-7xl px-4 py-4">
//                 <Carousel>
//                     <CarouselContent>
//                         {promotions
//                             .filter(p => p.categories.length > 0)
//                             .map(renderPromotionSlide)}
//                     </CarouselContent>
//                     <CarouselPrevious />
//                     <CarouselNext />
//                 </Carousel>
//             </div>
//         </div>
//     );
// };

const items = [
    {
        title: "Secure Payment",
        description: "Elementum feugiat diam",
        icon: Shield
    },
    {
        title: "Free Shipping",
        description: "Elementum feugiat diam",
        icon: Truck
    },
    {
        title: "Delivered with Care",
        description: "Elementum feugiat diam",
        icon: User
    },
    {
        title: "Excellent Service",
        description: "Elementum feugiat diam",
        icon: Heart
    }

]


// export default HeroSection;


import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Leaf, Shield, Truck, Heart, User } from "lucide-react";
const Feature = () => {
    return (
        <section className="py-10 border-b-2">
            <div className="grid md:grid-cols-4 gap-5">
                {items.map(item=>(
                    <div className="text-center group" key={item.title}>
                        <div className="bg-lime-200/50 w-16 h-16 rounded-full  flex items-center justify-center mx-auto mb-6">
                            <item.icon />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Feature;
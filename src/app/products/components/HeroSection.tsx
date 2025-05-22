// components/HeroSection.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PromotionDetails, PromotionType } from '@/types/domains/promotion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const promotions: PromotionDetails[] = [
    {
        promotionId: 1,
        description: "Up to 20% off on all Men's Clothing",
        promotionType: PromotionType.PERCENTAGE,
        discountValue: 20,
        categories: [{ categoryId: 11, name: "Clothing" }],
    },
    {
        promotionId: 2,
        description: "Flat $10 off on orders above $50",
        promotionType: PromotionType.FLAT,
        discountValue: 10,
        minimumOrderValue: 50,
        categories: [{ categoryId: 21, name: "Accessories" }],
    },
];

function renderPromotionSlide(promotion: PromotionDetails) {
    const category = promotion.categories[0]
    const headline = promotion.promotionType === "PERCENTAGE"
        ? `Get ${promotion.discountValue}% Off`
        : `Save $${promotion.discountValue}`
    const subheadline = promotion.description

    return (
        <CarouselItem key={promotion.promotionId}>
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center">
                {promotion.imageUrl ? (
                    <Image
                        src={promotion.imageUrl}
                        alt={promotion.description}
                        fill
                        className="object-cover"
                    />
                ) : null}
                <div className="relative z-10 text-center px-4">
                    <h2 className="text-2xl font-bold mb-2 drop-shadow-md">{headline}</h2>
                    <p className="mb-4 drop-shadow-md">{subheadline}</p>
                    {category && (
                        <Link href={`/category/${category.categoryId}`}>
                            <Button variant="secondary">Shop Now</Button>
                        </Link>
                    )}
                </div>
            </div>
        </CarouselItem>
    )
};

const HeroSection = () => {
    return (
        <div className="w-full border-b bg-background">
            <div className="mx-auto max-w-7xl px-4 py-4">
                <Carousel>
                    <CarouselContent>
                        {promotions
                            .filter(p => p.categories.length > 0)
                            .map(renderPromotionSlide)}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
};
  
export default HeroSection;
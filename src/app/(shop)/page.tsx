'use client';
import React, { useEffect } from 'react';
import HeroSection from '../products/components/Feature';
import FeaturedByCategory from '../components/FeaturedByCategory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categorySlice';
import { fetchPromotions } from '@/store/slices/promotionSlice';
import useDataFetch from '@/hooks/use-data-fetch';
import { getAllProducts } from '@/services/product';
import { CategoryTree } from '@/types/domains/category';
import { PromotionDetails, PromotionType } from '@/types/domains/promotion';
import { ProductPreview } from '@/types/domains/product';
import Testimonials from '../components/Testimonials';
import { ReviewDetails } from '@/types/domains/review';
import Banner from '../components/Banner';
import Feature from '../products/components/Feature';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';

const categories: CategoryTree[] = [
    {
        categoryId: 1,
        name: "Men",
        path: "0",
        subcategories: [
            {
                categoryId: 11,
                name: "Clothing",
                path: "0.0",
                subcategories: [
                    { categoryId: 111, name: "Shirts", path: "0.0.0", subcategories: [] },
                    { categoryId: 112, name: "Pants", path: "0.0.1", subcategories: [] },
                ],
            },
            {
                categoryId: 12,
                name: "Shoes",
                path: "0.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 2,
        name: "Women",
        path: "1",
        subcategories: [
            {
                categoryId: 21,
                name: "Accessories",
                path: "1.0",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 3,
        name: "Kids",
        path: "2",
        subcategories: [
            {
                categoryId: 31,
                name: "Toys",
                path: "2.0",
                subcategories: [],
            },
            {
                categoryId: 32,
                name: "Clothing",
                path: "2.1",
                subcategories: [
                    { categoryId: 321, name: "T-Shirts", path: "2.1.0", subcategories: [] },
                    { categoryId: 322, name: "Shorts", path: "2.1.1", subcategories: [] },
                ],
            },
        ],
    },
    {
        categoryId: 4,
        name: "Home",
        path: "3",
        subcategories: [
            {
                categoryId: 41,
                name: "Furniture",
                path: "3.0",
                subcategories: [],
            },
            {
                categoryId: 42,
                name: "Decor",
                path: "3.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 5,
        name: "Electronics",
        path: "4",
        subcategories: [
            {
                categoryId: 51,
                name: "Mobile Phones",
                path: "4.0",
                subcategories: [],
            },
            {
                categoryId: 52,
                name: "Laptops",
                path: "4.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 6,
        name: "Sports",
        path: "5",
        subcategories: [
            {
                categoryId: 61,
                name: "Outdoor",
                path: "5.0",
                subcategories: [],
            },
            {
                categoryId: 62,
                name: "Indoor",
                path: "5.1",
                subcategories: [],
            },
        ],
    },
    {
        categoryId: 7,
        name: "Beauty",
        path: "6",
        subcategories: [
            {
                categoryId: 71,
                name: "Skincare",
                path: "6.0",
                subcategories: [],
            },
            {
                categoryId: 72,
                name: "Makeup",
                path: "6.1",
                subcategories: [],
            },
        ],
    },
];

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

const products: any[] = [
    {
        "productId": 101,
        "productVariantId": 201,
        "categoryId": 12,
        "dateAdded": "2025-08-07T10:00:00Z",
        "quantityInStock": 75,
        "imageUrl": "https://i.pinimg.com/1200x/30/e5/ea/30e5eafa92ad00f4708c1ead88366f94.jpg",
        "price": 499.00,
        "title": "Classic Wooden Photo Frame",
        "code": "FRAME-WD-2025",
        "rating": 4.6,
        "starred": true
    },
    {
        "productId": 102,
        "productVariantId": 202,
        "categoryId": 12,
        "dateAdded": "2025-08-06T12:30:00Z",
        "quantityInStock": 60,
        "imageUrl": "https://i.pinimg.com/736x/a4/d5/e3/a4d5e30dda8441f09bf3db696a784d30.jpg",
        "price": 599.00,
        "title": "Minimalist Black Frame",
        "code": "FRAME-BLK-2025",
        "rating": 4.8,
        "starred": false
    },
    {
        "productId": 103,
        "productVariantId": 203,
        "categoryId": 12,
        "dateAdded": "2025-08-04T15:15:00Z",
        "quantityInStock": 45,
        "imageUrl": "https://i.pinimg.com/1200x/6a/8d/43/6a8d43779b641974f1d85959c9235756.jpg",
        "price": 749.00,
        "title": "Golden Antique Frame",
        "code": "FRAME-GLD-2025",
        "rating": 4.9,
        "starred": true
    },
];


const mockReviews: ReviewDetails[] = [
    {
        reviewId: 1,
        reviewText: "These shoes are incredibly comfortable and stylish. I've been wearing them daily!",
        customer: { customerId: 101, customerName: "Alice Johnson", email: "alicejohnson@gmail.com", phoneNumber: "123-456-7890" },
        productId: 201,
        productTitle: "CloudRunner Sneakers",
        rating: 4.8,
        dateOfSubmission: new Date("2024-08-22"),
    },
    {
        reviewId: 2,
        reviewText: "The quality of this jacket is top-notch. Keeps me warm even in heavy snow.",
        customer: { customerId: 102, customerName: "Mark Peterson", email: "markpeterson@gmail.com", phoneNumber: "987-654-3210" },
        productId: 202,
        productTitle: "ArcticShell Winter Jacket",
        rating: 4.9,
        dateOfSubmission: new Date("2025-01-15"),
    },
    {
        reviewId: 3,
        reviewText: "Lightweight and breathable fabric. Loved the design and fit.",
        customer: { customerId: 103, customerName: "Emily Zhang", email: "emilyzhang@gmail.com", phoneNumber: "555-123-4567" },
        productId: 203,
        productTitle: "AirFlex Yoga Pants",
        rating: 4.6,
        dateOfSubmission: new Date("2025-03-10"),
    },
];

export default function LandingPage() {
    // const { items: categories } = useAppSelector(state => state.categories);
    // const { items: promotions } = useAppSelector(state => state.promotions);
    // const productsData = useDataFetch(getAllProducts);

    useEffect(() => {
        // useAppDispatch(fetchCategories());
        // useAppDispatch(fetchPromotions());
        // productsData.request({});
    }, []);
    // const products = productsData.response;

    return (
        <>
            {/* Banner */}
            <section>
                <Banner />
            </section>
            <div className='responsive-container'>
                <section className="container mx-auto mb-8 px-4">
                    <Feature />
                </section>

                {/* Featured Products */}
                <h2 className="text-3xl text-center font-bold my-16">Featured Products</h2>
                <section className='mb-28' >

                    <FeaturedByCategory
                        categories={categories}
                        promotions={promotions}
                        products={products!}
                    />
                </section>


                {/* <section className="container mx-auto mb-16 px-4">
                    <Testimonials
                        reviews={mockReviews}
                    />
                </section> */}

                {/* Newsletter Section */}
                {/* <section className=" mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-gray-600 mb-6">Subscribe to our newsletter for exclusive offers and updates</p>
                        <form className="flex gap-2 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </section> */}
            </div>
            <section>
                <PromoBanner />
            </section>
        </>
    );
}
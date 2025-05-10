'use client';
import React, { useEffect } from 'react';
import HeroSection from './products/components/HeroSection';
import FeaturedByCategory from './components/FeaturedByCategory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categorySlice';
import { fetchPromotions } from '@/store/slices/promotionSlice';
import useDataFetch from '@/hooks/use-data-fetch';
import { getAllProducts } from '@/services/product';
import { CategoryTree } from '@/types/domains/category';
import { PromotionDetails, PromotionType } from '@/types/domains/promotion';
import { ProductPreview } from '@/types/domains/product';


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

const products: ProductPreview[] = [
    {
      productId: 1,
      productVariantId: 101,
      categoryId: 111, // Shirts
      dateAdded: new Date('2025-01-10'),
      quantityInStock: 45,
      imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
      price: 34.99,
      title: "Slim Fit Casual Shirt",
      rating: 4.4,
      starred: true,
    },
    {
      productId: 2,
      productVariantId: 102,
      categoryId: 112, // Pants
      dateAdded: new Date('2025-02-05'),
      quantityInStock: 30,
      imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
      price: 49.99,
      title: "Chino Pants",
      rating: 4.1,
      starred: false,
    },
    {
      productId: 3,
      productVariantId: 103,
      categoryId: 111,
      dateAdded: new Date('2025-02-25'),
      quantityInStock: 60,
      imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
      price: 28.00,
      title: "Cotton Oxford Shirt",
      rating: 4.5,
      starred: true,
    },
    {
      productId: 4,
      productVariantId: 104,
      categoryId: 12, // Shoes
      dateAdded: new Date('2025-03-01'),
      quantityInStock: 20,
      imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
      price: 89.99,
      title: "Leather Derby Shoes",
      rating: 4.6,
      starred: true,
    },
    {
      productId: 5,
      productVariantId: 105,
      categoryId: 112,
      dateAdded: new Date('2025-03-20'),
      quantityInStock: 35,
      imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
      price: 54.99,
      title: "Slim Fit Jeans",
      rating: 4.2,
      starred: false,
    },
    {
        productId: 6,
        productVariantId: 106,
        categoryId: 21, // Accessories
        dateAdded: new Date('2025-01-18'),
        quantityInStock: 100,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 79.99,
        title: "Leather Handbag",
        rating: 4.5,
        starred: true,
    },
    {
        productId: 7,
        productVariantId: 107,
        categoryId: 21,
        dateAdded: new Date('2025-02-11'),
        quantityInStock: 200,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 24.99,
        title: "Gold Plated Earrings",
        rating: 4.3,
        starred: false,
    },
    {
        productId: 8,
        productVariantId: 108,
        categoryId: 21,
        dateAdded: new Date('2025-02-28'),
        quantityInStock: 80,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 19.99,
        title: "Braided Waist Belt",
        rating: 4.1,
        starred: false,
    },
    {
        productId: 9,
        productVariantId: 109,
        categoryId: 21,
        dateAdded: new Date('2025-03-14'),
        quantityInStock: 140,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 29.99,
        title: "Silk Printed Scarf",
        rating: 4.6,
        starred: true,
    },
    {
        productId: 10,
        productVariantId: 110,
        categoryId: 21,
        dateAdded: new Date('2025-04-01'),
        quantityInStock: 90,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 22.50,
        title: "Wide Brim Hat",
        rating: 4.0,
        starred: false,
    },
    {
        productId: 11,
        productVariantId: 111,
        categoryId: 321, // T-Shirts
        dateAdded: new Date('2025-01-12'),
        quantityInStock: 60,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 14.99,
        title: "Graphic T-Shirt",
        rating: 4.7,
        starred: true,
    },
    {
        productId: 12,
        productVariantId: 112,
        categoryId: 322, // Shorts
        dateAdded: new Date('2025-02-01'),
        quantityInStock: 50,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 12.99,
        title: "Denim Shorts",
        rating: 4.3,
        starred: false,
    },
    {
        productId: 13,
        productVariantId: 113,
        categoryId: 31, // Toys
        dateAdded: new Date('2025-03-05'),
        quantityInStock: 80,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 34.99,
        title: "Building Blocks Set",
        rating: 4.8,
        starred: true,
    },
    {
        productId: 14,
        productVariantId: 114,
        categoryId: 31,
        dateAdded: new Date('2025-03-22'),
        quantityInStock: 100,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 22.99,
        title: "Fashion Doll",
        rating: 4.5,
        starred: true,
    },
    {
        productId: 15,
        productVariantId: 115,
        categoryId: 322,
        dateAdded: new Date('2025-04-08'),
        quantityInStock: 55,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 15.49,
        title: "Active Shorts",
        rating: 4.2,
        starred: false,
    },
    {
        productId: 16,
        productVariantId: 116,
        categoryId: 41, // Furniture
        dateAdded: new Date('2025-02-01'),
        quantityInStock: 12,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 199.99,
        title: "Modern Coffee Table",
        rating: 4.4,
        starred: true,
    },
    {
        productId: 17,
        productVariantId: 117,
        categoryId: 42, // Decor
        dateAdded: new Date('2025-02-14'),
        quantityInStock: 40,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 89.99,
        title: "Table Lamp",
        rating: 4.5,
        starred: true,
    },
    {
        productId: 18,
        productVariantId: 118,
        categoryId: 41,
        dateAdded: new Date('2025-03-02'),
        quantityInStock: 20,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 599.99,
        title: "3-Seater Sofa",
        rating: 4.6,
        starred: true,
    },
    {
        productId: 19,
        productVariantId: 119,
        categoryId: 42,
        dateAdded: new Date('2025-03-20'),
        quantityInStock: 80,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 39.99,
        title: "Framed Wall Art",
        rating: 4.2,
        starred: false,
    },
    {
        productId: 20,
        productVariantId: 120,
        categoryId: 42,
        dateAdded: new Date('2025-04-01'),
        quantityInStock: 30,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 24.99,
        title: "Ceramic Vase",
        rating: 4.3,
        starred: false,
    }      
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
            {/* Hero Section */}
            <section className="container mx-auto px-4">
                <HeroSection />
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4 py-12">
                <FeaturedByCategory
                    categories={categories}
                    promotions={promotions}
                    products={products!}
                />
            </section>

            {/* Benefits Section */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="mb-4">🚚</div>
                            <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                            <p className="text-gray-600">On orders over $50</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-4">🔒</div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                            <p className="text-gray-600">100% secure payment</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-4">💫</div>
                            <h3 className="text-xl font-semibold mb-2">Money Back Guarantee</h3>
                            <p className="text-gray-600">Within 30 days</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="container mx-auto px-4 py-16">
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
            </section>
        </>
    );
}
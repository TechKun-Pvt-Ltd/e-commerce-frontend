"use client";
import React, { useState, useEffect } from 'react';
import HeroSection from '../../products/components/Feature';
import Filters from '../../products/components/Filters';
import ProductGrid from '../../products/components/ProductGrid';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { fetchProducts } from '@/store/slices/productsSlice';
import { ProductBrowsePage } from './ProductBrowsePage';
import { CategoryDetails } from "@/types/domains/category";
import { AttributeType } from '@/types/domains/attribute';
import { Variation } from '@/types/domains/variation';
import { ProductPreview } from '@/types/domains/product';

const sampleCategoryDetails: CategoryDetails = {
    categoryId: 101,
    name: "Electronics",
    parentCategory: {
        categoryId: 100,
        name: "Home Appliances",
        variations: [],
        attributes: []
    },
    variations: [
        {
            variationId: 1,
            name: "Color"
        },
        {
            variationId: 2,
            name: "Size"
        }
    ],
    attributes: [
        {
            attributeId: 1,
            name: "Brand",
            type: AttributeType.ENUMERATED,
            allowedValues: ["Samsung", "LG", "Sony"]
        },
        {
            attributeId: 2,
            name: "Warranty",
            type: AttributeType.CUSTOM,
            allowedValues: ["1 year", "2 years"]
        }
    ]
};

const sampleVariations: Variation[] = [
    {
        variationId: 1,
        name: "Color",
        variationOptions: [
            {
                variationOptionId: 101,
                name: "Red"
            },
            {
                variationOptionId: 102,
                name: "Blue"
            }
        ]
    }, {
        variationId: 2,
        name: "Size",
        variationOptions: [
            {
                variationOptionId: 201,
                name: "Small"
            },
            {
                variationOptionId: 202,
                name: "Medium"
            },
            {
                variationOptionId: 203,
                name: "Large"
            }
        ]
    }
];

const productPreviews: ProductPreview[] = [
    {
        productId: 1001,
        productVariantId: 2001,
        categoryId: 101, // Electronics
        dateAdded: new Date("2023-10-01"),
        quantityInStock: 50,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 299.99,
        title: "Smartphone X",
        rating: 4.5,
        starred: true
    },
    {
        productId: 1002,
        productVariantId: 2002,
        categoryId: 101, // Electronics
        dateAdded: new Date("2023-09-15"),
        quantityInStock: 30,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 499.99,
        title: "Laptop Pro",
        rating: 4.7,
        starred: false
    },
    {
        productId: 1003,
        productVariantId: 2003,
        categoryId: 101, // Electronics
        dateAdded: new Date("2023-08-20"),
        quantityInStock: 20,
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        price: 199.99,
        title: "Wireless Headphones",
        rating: 4.3,
        starred: true
    }
];

export default function Products() {
    // const dispatch = useAppDispatch();
    // const { items: products, loading, error } = useAppSelector(state => state.products);

    // useEffect(() => {
    //   dispatch(fetchProducts());
    // }, [dispatch]);

    // const [priceRange, setPriceRange] = useState<[number, number]>([39, 60]);
    // const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    // const router = useRouter();

    return (
        <ProductBrowsePage
            categoryDetails={sampleCategoryDetails}
            variations={sampleVariations}
            allProducts={productPreviews}
        />
        // <div className="min-h-screen bg-gray-50 font-sans">
        //   <HeroSection />

        //   <div className="border-t border-gray-200 my-8"></div>

        //   <div className="flex flex-col lg:flex-row">
        //     <Filters
        //       priceRange={priceRange}
        //       onPriceRangeChange={setPriceRange}
        //       selectedSizes={selectedSizes}
        //       onSizesSelected={setSelectedSizes}
        //       selectedCategories={selectedCategories}
        //       onCategoriesSelected={setSelectedCategories}
        //     />
        //     <ProductGrid products={products} onProductClick={pId => router.push('/products/' + pId)} />
        //   </div>
        // </div>
    );
}
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ProductImage, ProductVariant } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchProductById } from "@/app/store/slices/productsSlice";

const ProductDetail = () => {
    const { productId } = useParams(); // Get productId from URL

    const [selectedImage, setSelectedImage] = useState<ProductImage>();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState("Paper");
    const [quantity, setQuantity] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { selectedProduct: product, loading, error } = useAppSelector((state) => state.products);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(Number.parseInt(productId as string)));
        }
    }, []);

    useEffect(() => {
        if (product) {
            const interval = setInterval(() => {
                nextSlide();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [currentIndex, product]);

    const nextSlide = () => {
        if (product) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % product.images.length);
        }
    };

    const increaseQuantity = () => setQuantity((prev) => prev + 1);
    const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    if (loading) {
        return <div className="text-center text-blue-500 text-2xl p-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 text-2xl p-10">{error}</div>;
    }

    if (!product) {
        return <div className="text-center text-red-500 text-2xl p-10">Product Not Found</div>;
    }

    const totalPrice = selectedVariant ? selectedVariant.price * quantity : 0;
    // const imageData = product.images[currentIndex].imageData;
    const currentImage = "";

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-start gap-12">
            {/* Left Section - Images */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="w-full max-w-lg">
                    <Image
                        src={currentImage}
                        alt={product.name}
                        width={500}
                        height={500}
                        className="rounded-xl shadow-lg w-full"
                    />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3 mt-4">
                    {product.images.map((img, index) => (
                        <button
                            key={index}
                            className={`w-20 h-20 border-2 ${selectedImage === img ? "border-blue-400" : "border-gray-300"} 
                            rounded-lg overflow-hidden hover:opacity-75`}
                            onClick={() => setSelectedImage(img)}
                        >
                            <Image src={""} alt="Thumbnail" width={80} height={80} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Section - Product Details */}
            <div className="w-full md:w-1/2">
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">{product.name}</h1>

                <div className="flex items-center gap-40 mb-6">
                    <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="text-3xl font-semibold text-gray-900">${totalPrice}</p>
                    </div>
                </div>

                <p className="text-gray-500 text-lg mb-6">{product.description}</p>

                {/* Shipping Details */}
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
                    <div className="text-center flex-1">
                        <div className="text-gray-700 text-3xl mx-auto mb-2" />
                        <p className="text-gray-700">Shipping</p>
                        <p className="text-gray-500">Within 2 Days</p>
                    </div>
                    <div className="border-l border-gray-300 h-12"></div>
                    <div className="text-center flex-1">
                        <div className="text-gray-700 text-3xl mx-auto mb-2" />
                        <p className="text-gray-700">Fast and Safe</p>
                        <p className="text-gray-500">Delivery</p>
                    </div>
                    <div className="border-l border-gray-300 h-12"></div>
                    <div className="text-center flex-1">
                        <div className="text-gray-700 text-3xl mx-auto mb-2" />
                        <p className="text-gray-700">14-Day Return</p>
                        <p className="text-gray-500">Easy Exchange</p>
                    </div>
                </div>

                {/* Size Selection */}
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Size:</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {product.variants.map((variant) => (
                            <button
                                key={variant.sizeOption.sizeOptionId}
                                className={`px-4 py-2 text-sm rounded-full transition ${selectedVariant?.sizeOption.sizeOptionId === variant.sizeOption.sizeOptionId ? "bg-blue-500 text-white" : "border border-gray-400 hover:bg-gray-200"
                                    }`}
                                onClick={() => setSelectedVariant(variant)}
                            >
                                {variant.sizeOption.value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Material Selection */}
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Material:</h3>
                    <div className="flex gap-2 mb-4">
                        {["Paper", "Canvas"].map((material) => (
                            <button
                                key={material}
                                className={`px-4 py-2 text-sm rounded-full transition ${selectedMaterial === material ? "bg-blue-500 text-white" : "border border-gray-400 hover:bg-gray-200"
                                    }`}
                                onClick={() => setSelectedMaterial(material)}
                            >
                                {material}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button className="flex-1 py-3 border rounded-lg text-gray-900 font-medium hover:bg-gray-100">
                        Add to Cart <div className="mx-auto text-xl inline" />
                    </button>
                    <button className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700">
                        Buy Now <div className="mx-auto text-xl inline" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
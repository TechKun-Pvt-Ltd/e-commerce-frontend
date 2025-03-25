"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ProductVariant, Product } from "@/app/types/models";

const ProductDetail = () => {
    const { productId } = useParams(); // Get productId from URL
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<ProductVariant | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState("Paper");
    const [quantity, setQuantity] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch product data from API
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8080/products/${productId}`);
                if (!response.ok) {
                    throw new Error("Product not found");
                }
                const data: Product = await response.json();
                setProduct(data);
                setSelectedImage(data.images[0]);
                setSelectedSize(data.variants[0]); // Set the first size as default
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

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

    const totalPrice = selectedSize ? selectedSize.price * quantity : 0;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-start gap-12">
            {/* Left Section - Images */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="w-full max-w-lg">
                    <Image
                        src={product.images[currentIndex]}
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
                            <Image src={img} alt="Thumbnail" width={80} height={80} className="w-full h-full object-cover" />
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
                        {product.sizes.map((size) => (
                            <button
                                key={size.productSizeId}
                                className={`px-4 py-2 text-sm rounded-full transition ${selectedSize?.productSizeId === size.productSizeId ? "bg-blue-500 text-white" : "border border-gray-400 hover:bg-gray-200"
                                    }`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size.size.name}
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
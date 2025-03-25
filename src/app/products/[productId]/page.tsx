"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ProductImage, ProductVariant } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchProductById } from "@/app/store/slices/productsSlice";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const ProductDetail = () => {
    const { productId } = useParams();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<ProductImage>();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState("Paper");
    const [quantity, setQuantity] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAddToCartModal, setShowAddToCartModal] = useState(false);
    const [showBuyNowModal, setShowBuyNowModal] = useState(false);
    const { selectedProduct: product, loading, error } = useAppSelector((state) => state.products);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(Number.parseInt(productId as string)));
        }
    }, [productId, dispatch]);

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

    const getImageUrl = (imageData: Uint8Array | undefined): string => {
        if (!imageData) return '';
        try {
            return `data:image/jpeg;base64,${Buffer.from(imageData).toString('base64')}`;
        } catch (error) {
            console.error('Error converting image data:', error);
            return '';
        }
    };

    const handleAddToCart = () => {
        if (!selectedVariant) {
            alert("Please select a size before adding to cart");
            return;
        }
        setShowAddToCartModal(true);
    };

    const handleBuyNow = () => {
        if (!selectedVariant) {
            alert("Please select a size before proceeding to checkout");
            return;
        }
        setShowBuyNowModal(true);
    };

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
    const currentImageUrl = getImageUrl(product.images[currentIndex]?.imageData);

    return (
        <>
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Left Section - Images */}
                    <div className="w-full md:w-1/2 flex flex-col items-center">
                        <div className="w-full max-w-lg">
                            <Image
                                src={currentImageUrl || '/placeholder-image.jpg'}
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
                                    <Image 
                                        src={getImageUrl(img.imageData) || '/placeholder-image.jpg'}
                                        alt="Thumbnail" 
                                        width={80} 
                                        height={80} 
                                        className="w-full h-full object-cover" 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Product Details */}
                    <div className="w-full md:w-1/2 space-y-6">
                        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">{product.name}</h1>

                        <div className="flex items-center gap-40 mb-6">
                            <div>
                                <p className="text-sm text-gray-400">Price</p>
                                <p className="text-3xl font-semibold text-gray-900">${totalPrice}</p>
                            </div>
                        </div>

                        <p className="text-gray-500 text-lg">{product.description}</p>

                        {/* Shipping Details */}
                        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
                            <div className="text-center flex-1">
                                <div className="text-gray-700 text-3xl mx-auto mb-2">🚚</div>
                                <p className="text-gray-700">Shipping</p>
                                <p className="text-gray-500">Within 2 Days</p>
                            </div>
                            <div className="border-l border-gray-300 h-12"></div>
                            <div className="text-center flex-1">
                                <div className="text-gray-700 text-3xl mx-auto mb-2">🛡️</div>
                                <p className="text-gray-700">Fast and Safe</p>
                                <p className="text-gray-500">Delivery</p>
                            </div>
                            <div className="border-l border-gray-300 h-12"></div>
                            <div className="text-center flex-1">
                                <div className="text-gray-700 text-3xl mx-auto mb-2">↩️</div>
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
                                        className={`px-4 py-2 text-sm rounded-full transition ${
                                            selectedVariant?.sizeOption.sizeOptionId === variant.sizeOption.sizeOptionId
                                                ? "bg-blue-500 text-white"
                                                : "border border-gray-400 hover:bg-gray-200"
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
                                        className={`px-4 py-2 text-sm rounded-full transition ${
                                            selectedMaterial === material
                                                ? "bg-blue-500 text-white"
                                                : "border border-gray-400 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setSelectedMaterial(material)}
                                    >
                                        {material}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selection */}
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Quantity:</h3>
                            <div className="flex items-center border rounded-md w-fit">
                                <button
                                    onClick={decreaseQuantity}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <span className="px-4 py-2 text-gray-900">{quantity}</span>
                                <button
                                    onClick={increaseQuantity}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 py-3 border rounded-lg text-gray-900 font-medium hover:bg-gray-100"
                            >
                                Add to Cart
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add to Cart Confirmation Modal */}
            <ConfirmationModal
                isOpen={showAddToCartModal}
                onClose={() => setShowAddToCartModal(false)}
                title="Added to Cart!"
                message={`${product.name} has been added to your cart. Would you like to view your cart now?`}
                primaryAction={{
                    label: "View Cart",
                    onClick: () => router.push('/cart')
                }}
                secondaryAction={{
                    label: "Continue Shopping",
                    onClick: () => setShowAddToCartModal(false)
                }}
            />

            {/* Buy Now Confirmation Modal */}
            <ConfirmationModal
                isOpen={showBuyNowModal}
                onClose={() => setShowBuyNowModal(false)}
                title="Proceed to Checkout"
                message={`Ready to purchase ${product.name}? You'll be redirected to the checkout page.`}
                primaryAction={{
                    label: "Proceed to Checkout",
                    onClick: () => router.push('/checkout')
                }}
                secondaryAction={{
                    label: "Cancel",
                    onClick: () => setShowBuyNowModal(false)
                }}
            />
        </>
    );
};

export default ProductDetail;
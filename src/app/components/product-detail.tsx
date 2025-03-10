"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaClock, FaTruck, FaExchangeAlt } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { TbShoppingBagPlus } from "react-icons/tb";

const ProductDetail = () => {
  const productImages = [
    "/product-image/canvas.jpg",
    "/product-image/canvas2.jpg",
    "/product-image/canvas3.jpg",
    "/product-image/canvas4.jpg"
  ]

  const [selectedImage, setSelectedImage] = useState(productImages[0]);
  const [selectedSize, setSelectedSize] = useState("XS - 6 x 8 in");
  const [selectedMaterial, setSelectedMaterial] = useState("Paper");
  const [selectedFrame, setSelectedFrame] = useState("Unframed");
  const [quantity, setQuantity] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);


  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval); // Cleanup interval
  }, [currentIndex]);

  // Go to next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % productImages.length);
  };


  const basePrice: Record<string, number> = {
    "XS - 6 x 8 in": 500,
    "S - 9 x 12 in": 700,
    "M - 12 x 16 in": 900,
    "L - 18 x 24 in": 1200,
    "XL - 24 x 32 in": 1500,
    "XXL - 30 x 40 in": 2000,
  };
  const materials = ["Paper", "Canvas"];
  const frames = ["Unframed", "Framed - Black", "Framed - White", "Framed - Brown"];

  const sizes = Object.keys(basePrice);
  // Calculating total price
  const totalPrice = basePrice[selectedSize]

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));



  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-start gap-12">
      {/* Left Section - Image & Thumbnails */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        {/* Main Image */}
        <div className="w-full max-w-lg">
          <Image
            src={productImages[currentIndex]}
            alt="Product Image"
            width={500}
            height={500}
            className="rounded-xl shadow-lg w-full"
          />
        </div>

        {/* Image Thumbnails */}
        <div className="flex gap-3 mt-4">
          {productImages.map((img, index) => (
            <button
              key={index}
              className={`w-20 h-20 border-2 ${selectedImage === img ? "border-blue-400" : "border-gray-300"
                } rounded-lg overflow-hidden hover:opacity-75`}
              onClick={() => setSelectedImage(img)}
            >
              <Image src={img} alt="Thumbnail" width={80} height={80} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Right Section - Product Details */}
      <div className="w-full md:w-1/2">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">Oceanic float</h1>

        {/* Price & Quantity Row */}
        <div className="flex items-center gap-40 mb-6">
          {/* Price Section */}
          <div>
            <p className="text-sm text-gray-400 ">Price</p>
            <p className="text-3xl font-semibold text-gray-900 inline">$500 - $2,000</p>
          </div>
        </div>

        <p className="text-gray-500 text-lg mb-6">Elegant botanical prints for nature lovers to add depth and beauty to your space.</p>

        {/* Order Details Section */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
          <div className="text-center flex-1">
            <FaClock className="text-gray-700 text-3xl mx-auto mb-2" />
            <p className="text-gray-700">Shipping</p>
            <p className="text-gray-500">Within 2 Days</p>
          </div>
          <div className="border-l border-gray-300 h-12"></div>
          <div className="text-center flex-1">
            <FaTruck className="text-gray-700 text-3xl mx-auto mb-2" />
            <p className="text-gray-700">Fast and Safe</p>
            <p className="text-gray-500">Delivery</p>
          </div>
          <div className="border-l border-gray-300 h-12"></div>
          <div className="text-center flex-1">
            <FaExchangeAlt className="text-gray-700 text-3xl mx-auto mb-2" />
            <p className="text-gray-700">14-Day Return</p>
            <p className="text-gray-500">Easy Exchange</p>
          </div>
        </div>


        {/* Price Section */}
        <div className="flex items-center justify-between mt-8 ">
          <div className="flex items-center space-x-4">
            <p className="text-xl text-gray-400 line-through">$350</p>
            <p className="text-2xl font-medium text-gray-900">${totalPrice}</p>
          </div>
          {/* Quantity Selector */}
          <div className="flex items-center border rounded-full mt-2 overflow-hidden">
            <button
              onClick={decreaseQuantity}
              className="px-4 py-2 border-r bg-gray-200"
            >
              -
            </button>
            <span className="px-6 py-2 text-lg font-semibold">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="px-4 py-2  border-l bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Size:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {sizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 text-sm rounded-full transition ${selectedSize === size ? "bg-blue-500 text-white" : "border border-gray-400 hover:bg-gray-200"
                  }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Material Selection */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Material:</h3>
          <div className="flex gap-2 mb-4">
            {materials.map((material) => (
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

        {/* Frame Selection */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Frame:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {frames.map((frame) => (
              <button
                key={frame}
                className={`px-4 py-2 text-sm rounded-full transition ${selectedFrame === frame ? "bg-blue-500 text-white" : "border border-gray-400 hover:bg-gray-200"
                  }`}
                onClick={() => setSelectedFrame(frame)}
              >
                {frame}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 py-3 border rounded-lg text-gray-900 font-medium hover:bg-gray-100">
            Add to Cart <TbShoppingBagPlus className="mx-auto text-xl inline" />
          </button>
          <button className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-yellow-900">
            Buy Now <TiShoppingCart className="mx-auto text-xl inline" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;


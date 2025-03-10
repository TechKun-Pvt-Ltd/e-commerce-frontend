"use client";
import React, { useState } from "react";
import Image from "next/image";
import canvasImg from "@/app/product-image/Canvas.jpeg";
import { FaClock, FaTruck, FaExchangeAlt} from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { TbShoppingBagPlus } from "react-icons/tb";

const ProductDetail = () => {
  const [selectedSize, setSelectedSize] = useState("XS - 6 x 8 in");
  const [selectedMaterial, setSelectedMaterial] = useState("Paper");
  const [selectedFrame, setSelectedFrame] = useState("Unframed");
  const [quantity, setQuantity] = useState(1);

  const sizes = [
    "XS - 6 x 8 in",
    "S - 9 x 12 in",
    "M - 12 x 16 in",
    "L - 18 x 24 in",
    "XL - 24 x 32 in",
    "XXL - 30 x 40 in",
  ];
  const materials = ["Paper", "Canvas"];
  const frames = ["Unframed", "Framed - Black", "Framed - White", "Framed - Brown"];

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-start gap-12">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <Image src={canvasImg} alt="Sun Tree Artwork" className="rounded-xl shadow-xl w-full max-w-lg" />
      </div>

      {/* Right Section - Product Details */}
      <div className="w-full md:w-1/2">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">Sun Tree</h1>
        
        {/* Price & Quantity Row */}
        <div className="flex items-center gap-40 mb-6">
          {/* Price Section */}
          <div>
            <p className="text-sm text-gray-400">Price</p>
            <p className="text-2xl font-semibold text-gray-900">Rs. 500</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-400 rounded transition">
            <button
              onClick={decreaseQuantity}
              className="px-4 py-2 text-lg border-r border-gray-400 hover:bg-gray-200"
            >
              -
            </button>
            <span className="px-6 py-2 text-lg font-semibold">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="px-4 py-2 text-lg border-l border-gray-400 hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-lg mb-6">Elegant botanical prints for nature lovers to add depth and beauty to your space.</p>

        {/* Size Selection */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Size:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {sizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 text-sm rounded-full transition ${
                  selectedSize === size ? "bg-yellow-800 text-white" : "border border-gray-400 hover:bg-gray-200"
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
                className={`px-4 py-2 text-sm rounded-full transition ${
                  selectedMaterial === material ? "bg-yellow-800 text-white" : "border border-gray-400 hover:bg-gray-200"
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
                className={`px-4 py-2 text-sm rounded-full transition ${
                  selectedFrame === frame ? "bg-yellow-800 text-white" : "border border-gray-400 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedFrame(frame)}
              >
                {frame}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-x-2">
          <button className="w-60 px-6 py-3 border border-gray-700 rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition">
            Add to Cart <TbShoppingBagPlus className="mx-auto text-xl inline"/>
          </button>
          <button className="w-60 px-6 py-3 bg-yellow-800 text-white font-medium rounded-lg hover:bg-yellow-900 transition">
            Buy Now <TiShoppingCart className="mx-auto text-xl inline" />
          </button>
        </div>

        {/* Order Details Section */}
        <div className="flex justify-between items-center mt-6 pt-4">
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
            <p className="text-gray-700">Within 14 Days</p>
            <p className="text-gray-500">Easy Exchange / Return</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

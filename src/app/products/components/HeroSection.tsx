// components/HeroSection.tsx
"use client";
import React from 'react';

const HeroSection = () => {
  return (
    <div className="mb-12 bg-gradient-to-r from-black to-gray-900 rounded-lg p-8 text-white">
      <h1 className="text-6xl font-bold mb-4">PRINTS</h1>
      <p className="max-w-3xl text-gray-100 text-lg mb-6">
        We take pride in the quality of our products and use only the highest quality materials to
        ensure that each poster is durable and long-lasting. Browse our collection and discover
        the perfect geometric poster to add a touch of sophistication to your home or office.
      </p>
      <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
        Shop Now
      </button>
    </div>
  );
};

export default HeroSection;
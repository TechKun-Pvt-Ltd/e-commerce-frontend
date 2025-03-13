// components/Navbar.tsx
"use client";
import React from 'react';

const Navbar = () => {
  return (
    <nav className="flex items-center space-x-8">
      <a href="#" className="text-gray-600 hover:text-black transition-colors duration-200">Home</a>
      <a href="#" className="text-gray-600 hover:text-black transition-colors duration-200">Blog</a>
      <a href="#" className="text-gray-600 hover:text-black transition-colors duration-200">About</a>
      <a href="#" className="text-gray-600 hover:text-black transition-colors duration-200">Contact</a>
      <div className="flex items-center space-x-4">
        <a href="#" className="text-gray-600 hover:text-black transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </a>
        <a href="#" className="text-gray-600 hover:text-black transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
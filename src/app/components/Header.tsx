"use client";
import React, { useState } from 'react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Free shipping on all orders over $50 • Use code15 at checkout to get 15% off
      </div>

      {/* Header/Navigation */}
      <header className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
          <div className="text-2xl font-bold text-gray-900">KIOSKO</div>
          
          {/* Enhanced Search Bar */}
          <div className="w-full max-w-2xl px-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for products, brands, and more..."
                className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          
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
        </div>
      </header>

      <div className="border-t border-gray-200"></div>
    </>
  );
};

export default Header;
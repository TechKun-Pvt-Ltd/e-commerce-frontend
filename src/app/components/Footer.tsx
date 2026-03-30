// components/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">About KIOSKO</h3>
            <p className="text-gray-600 text-sm">
              KIOSKO offers premium geometric art prints made with the highest quality materials.
              Our mission is to bring beautiful, affordable art to every home.
            </p>
            {/* Iyzico Payment Band */}
            <div className="mt-8">
              <span className="block text-gray-400 text-xs mb-2 uppercase tracking-widest">Secure Payment</span>
              <img
                src="/iyzico-logo-pack/iyzico-logo-pack/footer_iyzico_ile_ode/Colored/logo_band_colored.svg"
                alt="iyzico ile öde - güvenli ödeme"
                className="h-9 object-contain"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Shop</h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><a href="#" className="hover:text-black transition-colors duration-200">All Prints</a></li>
              <li><a href="#" className="hover:text-black transition-colors duration-200">New Arrivals</a></li>
              <li><a href="#" className="hover:text-black transition-colors duration-200">Bestsellers</a></li>
              <li><a href="#" className="hover:text-black transition-colors duration-200">Sale</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Service</h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><a href="#" className="hover:text-black transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" className="hover:text-black transition-colors duration-200">FAQ</a></li>
              <li><a href="/shipping-returns" className="hover:text-black transition-colors duration-200">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-black transition-colors duration-200">Track Your Order</a></li>
              <li><a href="/about-us" className="hover:text-black transition-colors duration-200">About Us</a></li>
              <li><a href="/terms-and-conditions" className="hover:text-black transition-colors duration-200">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="hover:text-black transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Subscribe</h3>
            <p className="text-gray-600 text-sm mb-4">
              Sign up for our newsletter and get 10% off your first order.
            </p>
            <div className="flex ">
              <input
                type="email"
                placeholder="Your email"
                className="border border-gray-300 px-4 py-2 w-full text-sm rounded-l-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button className="bg-black w-28 text-white px-4 py-2 text-sm rounded-r-lg hover:bg-gray-900 transition-colors duration-200">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2025 KIOSKO. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

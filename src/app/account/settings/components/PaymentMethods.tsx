"use client";

import { useState } from "react";
import PaymentForm from "@/app/checkout/components/PaymentForm";

export default function PaymentMethods() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Payment Methods</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
      </div>
      <div className="space-y-6">
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-gray-800 font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200">
              Remove
            </button>
          </div>
        </div>
        {!showPaymentModal ? (
          <button 
            onClick={() => setShowPaymentModal(true)} 
            className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-700 hover:border-gray-800 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          >
            <span className="flex items-center justify-center space-x-2">
              <span className="text-xl">+</span>
              <span>Add New Payment Method</span>
            </span>
          </button>
        ) : (
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Payment Method</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <PaymentForm
              onSubmit={(data) => {
                console.log('New payment method:', data);
                setShowPaymentModal(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

export default function PaymentMethods() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold text-gray-900">Payment Methods</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Saved Cards</h3>
            <Button
              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-medium shadow-md hover:from-gray-900 hover:to-black transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-8 h-8 text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/24</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing Address</h3>
          <p className="text-gray-600 mb-4">Your billing address should match your card's address.</p>
          <Button
            variant="outline"
            className="px-6 py-2.5 border-2 border-gray-800 text-gray-800 rounded-xl font-medium hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            Update Billing Address
          </Button>
        </div>
      </div>
    </div>
  );
}
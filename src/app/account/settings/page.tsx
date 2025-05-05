"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";

import Sidebar from "./components/Sidebar";
import PersonalInformation from "./components/PersonalInformation";
import OrderHistory from "./components/OrderHistory";
import Security from "./components/Security";
import PaymentMethods from "./components/PaymentMethods";
import Reviews from "./components/Reviews";
import SupportTickets from "./components/SupportTickets";

interface UserData {
  fullName: string;
  email: string;
  phoneNo: string;
  address: string;
}

const tabLabels: Record<string, string> = {
  personal: "Personal Information",
  orders: "Order History",
  reviews: "My Reviews",
  security: "Security",
  payment: "Payment Methods",
  support: "Support Tickets",
};

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("personal");

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in Required</h2>
            <p className="text-gray-600 mb-8">Please sign in to access your account settings</p>
            <Link
              href="/auth/login"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Sign in
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-gray-800 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const initialUserData: UserData = {
    fullName: session?.user?.fullName || "",
    email: session?.user?.email || "",
    phoneNo: "",
    address: "",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8">
          {/* Breadcrumb */}
          <Breadcrumb>
            <Breadcrumb.Item href="/account/settings">Account Settings</Breadcrumb.Item>
            <Breadcrumb.Item isCurrent>{tabLabels[activeTab]}</Breadcrumb.Item>
          </Breadcrumb>
          {/* Content */}
          {activeTab === "personal" && <PersonalInformation initialData={initialUserData} />}
          {activeTab === "orders" && <OrderHistory />}
          {activeTab === "security" && <Security />}
          {activeTab === "payment" && <PaymentMethods />}
          {activeTab === "reviews" && <Reviews />}
          {activeTab === "support" && <SupportTickets />}
        </main>
      </div>
    </div>
  );
}
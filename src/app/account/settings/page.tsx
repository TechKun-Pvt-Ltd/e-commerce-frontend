"use client";
import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("personal");
  

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
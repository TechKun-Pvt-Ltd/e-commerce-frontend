"use client";

import { useSession, signOut } from "next-auth/react";
import {
  User2,
  PackageSearch,
  Star,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  LogOut
} from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { data: session } = useSession();

  const tabs: Tab[] = [
    { id: "personal", label: "Personal Information", icon: <User2 className="w-5 h-5" /> },
    { id: "orders", label: "Order History", icon: <PackageSearch className="w-5 h-5" /> },
    { id: "reviews", label: "My Reviews", icon: <Star className="w-5 h-5" /> },
    { id: "security", label: "Security", icon: <ShieldCheck className="w-5 h-5" /> },
    { id: "payment", label: "Payment Methods", icon: <CreditCard className="w-5 h-5" /> },
    { id: "support", label: "Support Tickets", icon: <LifeBuoy className="w-5 h-5" /> },
  ];

  return (
    <aside className="flex flex-col h-screen w-60 bg-white border-r border-gray-200 text-gray-800 select-none">
      <div>
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {session?.user?.name?.[0] || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{session?.user?.name || "User"}</h2>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50 text-gray-700"}
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="px-2 py-4 border-t border-gray-200 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-gray-50 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
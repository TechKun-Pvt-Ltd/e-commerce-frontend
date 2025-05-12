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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <aside className="w-64 h-[calc(100vh-4rem)] lg:h-screen sticky top-0 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center text-white font-semibold text-lg mb-3 shadow-lg">
              {session?.user?.fullName?.[0] || "U"}
            </div>
            <h2 className="text-sm font-semibold text-gray-900">{session?.user?.fullName || "User"}</h2>
            <p className="text-xs text-gray-500 mt-1 truncate max-w-full">{session?.user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200",
                activeTab === tab.id && "bg-gray-100 text-gray-900 hover:bg-gray-100 shadow-sm"
              )}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
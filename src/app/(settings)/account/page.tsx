"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import Sidebar from "./components/Sidebar";
import PersonalInformation from "./components/PersonalInformation";
import OrderHistory from "./components/OrderHistory";
import Reviews from "./components/Reviews";
import SupportTickets from "./components/SupportTickets";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";

const tabs: Record<string, {label: string, Component: React.FC }> = {
    account: {
        label: "Account Settings",
        Component: PersonalInformation
    },
    orders: {
        label: "Order History",
        Component: OrderHistory
    },
    reviews: {
        label: "My Reviews",
        Component: Reviews
    },
    support: {
        label: "Support Tickets",
        Component: SupportTickets
    },
};

export default function AccountSettings() {
    const { authenticated, loading } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [activeTabKey, setActiveTabKey] = useState("account");

    useEffect(() => {
        if (!loading && !authenticated) {
            router.push("/auth/login");
        }
    }, [loading, authenticated]);

    const activeTab = tabs[activeTabKey];
    const ActiveTabComponent = activeTab.Component;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Mobile Menu Button */}
            <div className="lg:hidden p-4 border-b bg-white">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <Sidebar activeTab={activeTabKey} setActiveTab={setActiveTabKey} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <Sidebar activeTab={activeTabKey} setActiveTab={setActiveTabKey} />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Breadcrumb>
                            <Breadcrumb.Item href="/account/settings">My Account</Breadcrumb.Item>
                            <Breadcrumb.Item isCurrent>{activeTab.label}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    {/* Content */}
                    <div className="">
                        <ActiveTabComponent />
                    </div>
                </main>
            </div>
        </div>
    );
};

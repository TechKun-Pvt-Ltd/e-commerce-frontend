"use client";
import { SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LifeBuoy, LogOut, MoreVerticalIcon, PackageSearch, Star, User2 } from "lucide-react"
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserMenuContent from "@/app/components/UserMenuContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { logout } from "@/store/slices/authSlice";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NAVBAR_HEIGHT } from "@/lib/constants";

const items = [
    {
        title: "Account Settings",
        url: "/account/settings",
        icon: User2
    },
    {
        title: "Order History",
        url: "/account/orders",
        icon: PackageSearch
    },
    {
        title: "My Reviews",
        url: "/account/reviews",
        icon: Star
    },
    {
        title: "Support Tickets",
        url: "/account/support",
        icon: LifeBuoy
    }
];

export default function MyAccountLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, authenticated } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !authenticated) {
            toast('You are not logged in!', { icon: null, richColors: true });
            router.push('/auth/login');
        }
    }, [loading, authenticated]);

    return <SidebarProvider className="">
        <Sidebar collapsible="icon" style={{"--sidebar": "white", height: `calc(100vh - ${NAVBAR_HEIGHT})`, insetBlock: NAVBAR_HEIGHT} as any}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-gradient-to-r from-gray-800 to-black text-white">{user?.fullName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user?.fullName}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <MoreVerticalIcon className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="min-w-56"
                                side="right"
                                align="start"
                            >
                                <UserMenuContent />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    {items.map(item => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => dispatch(logout())}
                            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <main className="h-full flex-1 overflow-y-auto bg-gray-50">
            <div className="flex items-center gap-2 px-4 py-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2" style={{height: '1rem'}} />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/account/settings">My Account</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Account Setings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="px-6 py-4">{children}</div>
        </main>
    </SidebarProvider>;
};

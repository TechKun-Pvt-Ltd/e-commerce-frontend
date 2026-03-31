/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";
import { SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { useEffect, useMemo } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tags, LogOut, MoreVerticalIcon, Shapes, SlidersHorizontal, Package, LayoutDashboard, Percent, ShipWheelIcon, Truck, CreditCardIcon } from "lucide-react"
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserMenuContent from "@/app/components/UserMenuContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { UserRole } from "@/types/domains/user";
import Spinner from "@/components/ui/spinner";

const items = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Products",
        url: "/admin/products",
        icon: Package,  // Package icon represents products/items
        children: [
            {
                title: "New Product",
                url: "/admin/products/product-form"
            }
        ]
    },
    {
        title: "Categories",
        url: "/admin/categories",
        icon: Tags  // Tags icon represents categories/taxonomy
    },
    {
        title: "Variations",
        url: "/admin/variations",
        icon: SlidersHorizontal  // Layers icon represents different variations/versions
    },
    {
        title: "Attributes",
        url: "/admin/attributes",
        icon: Shapes  // Sliders icon represents adjustable attributes/properties
    },
    {
        title: "Promotions",
        url: "/admin/promotions",
        icon: Percent  // Sliders icon represents adjustable promotion/properties
    },
    {
        title: "Shipping Methods",
        url: "/admin/shipping-methods",
        icon: Truck  // Sliders icon represents adjustable Shipping-Method/properties
    },
    {
        title: "Order Shipping",
        url: "/admin/orders-shipping",
        icon: ShipWheelIcon  // ShipWheelIcon icon represents adjustable Order Shipping/properties
    }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, authenticated } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const breadcrumbItems = useMemo(
        () => {
            const breadcrumbItems: {
                title: string,
                url: string,
            }[] = [];
            const activeItem = items.find(item => pathname.startsWith(item.url));
            if (!activeItem) return breadcrumbItems;

            breadcrumbItems.push(activeItem);
            const childItem = activeItem.children?.find(child => pathname.startsWith(child.url));
            if (childItem)
                breadcrumbItems.push(childItem);

            return breadcrumbItems;
        },
        [pathname]
    );

    useEffect(() => {
        if (loading) return;
        if (!(authenticated && (user?.roleName === UserRole.ADMIN || user?.roleName === UserRole.PLATFORM_ADMIN))) {
            toast('You are not authorized!', { icon: null, richColors: true });
            router.push('/auth/login');
        } else {
            const expiresAt = localStorage.getItem("expiresAt");
            if (expiresAt === null)
                return;
            const expiresIn = parseInt(expiresAt) - Date.now();
            setTimeout(() => {
                toast('Your session has expired!', { icon: null, richColors: true });
                dispatch(logout());
                router.push('/auth/login');
            }, expiresIn);
        }
    }, [loading, authenticated]);

    return <SidebarProvider className="" style={{ minHeight: 0 }}>
        <Sidebar collapsible="icon" style={{height: `calc(100vh - ${NAVBAR_HEIGHT})`, insetBlock: NAVBAR_HEIGHT} as any}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton tooltip={user?.fullName}
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-gradient-to-r from-gray-800 to-black text-white">
                                            {loading? <Spinner className="size-4" />: authenticated && user? user.fullName[0] : "!"}
                                        </AvatarFallback>
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
                            <SidebarMenuButton tooltip={item.title} asChild>
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
                            className="text-red-600 hover:text-red-600 hover:bg-red-100"
                        >
                            <LogOut />
                            Logout
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <main className="self-stretch flex-1 min-w-0 overflow-x-hidden bg-gray-50 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2" style={{height: '1rem'}} />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/categories">Admin Settings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {breadcrumbItems.map((item, i) => i === breadcrumbItems.length - 1 ?
                            <BreadcrumbItem key={item.url}>
                                <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            </BreadcrumbItem>:
                            <React.Fragment key={item.url}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </React.Fragment>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="px-6 py-4 flex-1">{children}</div>
        </main>
    </SidebarProvider>;
};

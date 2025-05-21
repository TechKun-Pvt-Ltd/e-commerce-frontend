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
import { LifeBuoy, LogOut, MoreVerticalIcon, PackageSearch, Star, User2 } from "lucide-react"
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserMenuContent from "@/app/components/UserMenuContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { UserRole } from "@/types/domains/user";

const items = [
    {
        title: "Categories",
        url: "/admin/categories",
        icon: LifeBuoy
    }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, authenticated } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const currentPathTitle = useMemo(
        () => items.find(item => item.url === pathname)?.title,
        [pathname]
    );

    useEffect(() => {
        if (!loading && !(authenticated && (user?.roleName === UserRole.ADMIN || user?.roleName === UserRole.PLATFORM_ADMIN))) {
            toast('You are not authorized!', { icon: null, richColors: true });
            router.push('/auth/login');
        }
    }, [loading, authenticated]);

    return <SidebarProvider className="" style={{ height: `calc(100vh - ${NAVBAR_HEIGHT})`, minHeight: 0 }}>
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
                        <BreadcrumbItem>
                            <BreadcrumbPage>{currentPathTitle}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="px-6 py-4 flex-1">{children}</div>
        </main>
    </SidebarProvider>;
};

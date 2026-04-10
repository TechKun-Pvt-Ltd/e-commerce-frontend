"use client";
import React from 'react';
import { LogIn, UserPlus2Icon, Package, CircleUserRoundIcon, LogOut } from "lucide-react"
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import Link from 'next/link';
import { logout } from '@/store/slices/authSlice';

export default function UserMenuContent() {
    const dispatch = useAppDispatch();
    const { authenticated } = useAppSelector(state => state.auth);

    return authenticated ? (
        <>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href="/account/settings" className="flex items-center gap-2">
                    <CircleUserRoundIcon />
                    Account Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/account/orders" className="flex items-center gap-2">
                    <Package />
                    Orders
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => dispatch(logout())}>
                <LogOut />
                Logout
            </DropdownMenuItem>
        </>
    ) : (
        <>
            <DropdownMenuItem asChild>
                <Link href="/auth/login" className="flex items-center gap-2">
                    <LogIn />
                    Login
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/auth/register" className="flex items-center gap-2">
                    <UserPlus2Icon />
                    Register
                </Link>
            </DropdownMenuItem>
        </>
    );
}
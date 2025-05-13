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
            <DropdownMenuItem>
                <CircleUserRoundIcon />
                <Link href="/account/settings">Account Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Package />
                <Link href="/account/orders">Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => dispatch(logout())}>
                <LogOut />
                Logout
            </DropdownMenuItem>
        </>
    ) : (
        <>
            <DropdownMenuItem>
                <LogIn />
                <Link href="/auth/login">Login</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <UserPlus2Icon />
                <Link href="/auth/register">Register</Link>
            </DropdownMenuItem>
        </>
    );
}
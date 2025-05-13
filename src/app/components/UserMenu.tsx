"use client";
import React from 'react';
import { UserRound, LogIn, UserPlus2Icon, Package, CircleUserRoundIcon, LogOut } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { logout } from '@/store/slices/authSlice';

export default function UserMenu() {
    const dispatch = useAppDispatch();
    const { authenticated } = useAppSelector(state => state.auth);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu">
                    <UserRound className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {authenticated ? (
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
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
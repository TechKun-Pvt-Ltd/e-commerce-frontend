/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Mail, Phone, Calendar, Shield, Trash2, RefreshCw } from "lucide-react";
import { getAllUsers, removeUser } from "@/services/user";
import { ShopUser } from "@/types/domains/user";
import useDataFetch from "@/hooks/use-data-fetch";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [userList, setUserList] = useState<ShopUser[]>([]);
    const { isLoading, hasError, request } = useDataFetch(getAllUsers);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        request({})
            .onSuccess((res: ShopUser[]) => {
                setUserList(res || []);
            })
            .onError((err: any) => {
                console.error("Error loading users:", err);
                toast.error("Failed to load customer list.");
            });
    };

    const handleDeleteUser = async (userId: number, name: string) => {
        if (!confirm(`Are you sure you want to deactivate customer "${name}"?`)) return;
        try {
            await removeUser(userId);
            toast.success(`Customer "${name}" has been removed.`);
            loadUsers();
        } catch (error) {
            console.error("Error removing user:", error);
            toast.error("Failed to remove customer.");
        }
    };

    const filteredUsers = userList.filter((u) => {
        const q = search.toLowerCase();
        const fullName = u.fullName?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        const phone = u.phoneNo?.toLowerCase() || "";
        const city = u.address?.city?.toLowerCase() || "";
        return fullName.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View, search, and manage registered store customers and accounts.
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-white bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Search bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name, email, phone, or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    />
                </div>
            </div>

            {/* Content State */}
            {isLoading && userList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Spinner className="h-8 w-8 text-primary mb-3" />
                    <p className="text-sm text-gray-500">Loading customers...</p>
                </div>
            ) : hasError && userList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-red-100 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-red-600 mb-2">Failed to load customer list</p>
                    <p className="text-xs text-gray-500 mb-4">There was a problem retrieving data from the server.</p>
                    <button
                        onClick={loadUsers}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-base font-medium text-gray-700">No customers found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {search ? "No customer accounts match your search criteria." : "There are currently no registered customers."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/75">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredUsers.map((u) => {
                                    const initial = u.fullName ? u.fullName.charAt(0).toUpperCase() : "U";
                                    const roleName = u.role?.name || "CUSTOMER";
                                    const isCustomerRole = roleName === "CUSTOMER";

                                    return (
                                        <tr key={u.userId} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm shrink-0">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{u.fullName || "Unnamed User"}</p>
                                                        <p className="text-xs text-gray-400">ID: #{u.userId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-900">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{u.email}</span>
                                                    </div>
                                                    {u.phoneNo && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                            <span>{u.phoneNo}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {u.address ? (
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                            <span>{[u.address.city, u.address.country].filter(Boolean).join(", ") || "Address set"}</span>
                                                        </div>
                                                        {u.address.pincode && (
                                                            <p className="text-xs text-gray-400 pl-4.5">Zip: {u.address.pincode}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No address on file</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isCustomerRole
                                                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                                            : "bg-purple-50 text-purple-700 border border-purple-200/60"
                                                    }`}
                                                >
                                                    <Shield className="h-3 w-3" />
                                                    {roleName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{u.joinedAt ? format(new Date(u.joinedAt), "MMM dd, yyyy") : "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => handleDeleteUser(u.userId, u.fullName)}
                                                    title="Deactivate / Remove User"
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between items-center">
                        <span>Showing {filteredUsers.length} of {userList.length} customer accounts</span>
                    </div>
                </div>
            )}
        </div>
    );
}

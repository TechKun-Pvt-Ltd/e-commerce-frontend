"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveMyInformation } from "@/store/slices/authSlice";

export default function PersonalInformation() {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector(state => state.auth);
    const { toast } = useToast();
    const [userData, setUserData] = useState(user!);

    const handleSave = async () => {
        const res = await dispatch(saveMyInformation({
            fullName: userData?.fullName,
            address: userData?.address
        }));
        if (res.payload) {
            toast({
                title: "Success",
                description: "Profile updated successfully",
                variant: "default",
            });
        } else {
            toast({
                title: "Error",
                description: res.payload,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center">
                <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Full Name</label>
                        <Input
                            name="fullName"
                            value={user?.fullName}
                            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Email Address</label>
                        <Input
                            name="email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your email"
                            type="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Phone Number</label>
                        <Input
                            name="phoneNo"
                            value={userData.phoneNo}
                            onChange={(e) => setUserData({ ...userData, phoneNo: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Address</label>
                        <Textarea
                            name="address"
                            value={userData.address}
                            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your address"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-medium shadow-md hover:from-gray-900 hover:to-black transition-all duration-200"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
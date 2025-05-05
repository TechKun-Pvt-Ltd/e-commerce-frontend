"use client";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  fullName: string;
  email: string;
  phoneNo: string;
  address: string;
}

interface PersonalInformationProps {
  initialData: UserData;
}

export default function PersonalInformation({ initialData }: PersonalInformationProps) {
  const [userData, setUserData] = useState<UserData>(initialData);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/user");
        setUserData(response.data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, []);
  

  const handleSave = async () => {
    try {
      // PUT request to update user data
      const res = await axios.put("/api/account/settings/personalInformation", userData);
      console.log(res.data);
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Personal Information</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <label className="text-sm font-medium mb-2 block">Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            name="fullName"
            value={userData.fullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <label className="text-sm font-medium mb-2 block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <label className="text-sm font-medium mb-2 block">Phone Number</label>
          <input
            type="tel"
            placeholder="----------"
            name="phoneNo"
            value={userData.phoneNo}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <label className="text-sm font-medium mb-2 block">Address</label>
          <textarea
            name="address"
            placeholder="Your address"
            value={userData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
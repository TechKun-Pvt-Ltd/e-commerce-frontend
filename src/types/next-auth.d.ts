import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User;
    token: string;
  }

  interface User {
    userId: number,
    password: string,
    fullName: string,
    email: string,
    phoneNo: string,
    address: {
      addressId: number,
      addressLine: string,
      city: string,
      pincode: number,
      country: string
    },
    role: {
      roleId: number,
      name: string,
      authority: string
    },
    joinedAt: Date,
    removed: boolean
  }
} 
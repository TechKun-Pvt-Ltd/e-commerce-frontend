import { DefaultSession } from "next-auth";
import { ShopUser } from "./domains/user";

declare module "next-auth" {
  interface Session {
    user: User;
    token: string;
  }

  interface User extends ShopUser {
  }
} 
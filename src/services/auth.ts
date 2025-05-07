import servicesApiClient from "@/lib/services-api-client";
import type { ServiceFunction } from "@/types/api";
import {
    RegistrationPayload, LoginPayload, TokenPayload,
    ForgotPasswordPayload, ResetPasswordPayload,
    ChangePasswordPayload, DeleteAccountPayload,
    UserEssentials
} from "@/types/domains/auth";
import type { ShopUser } from "@/types/domains/user";

export const register: ServiceFunction<RegistrationPayload, ShopUser> = (payload) => {
    return servicesApiClient.post("/auth/register", { data: payload });
};

export const login: ServiceFunction<LoginPayload, TokenPayload> = async (payload) => {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    return (res.ok ? {
        data,
        success: true
    } : {
        success: false,
        error: data?.error
    });
};

export const me: ServiceFunction<[], UserEssentials> = () => {
    return servicesApiClient.get("/auth/me");
};

export const forgotPassword: ServiceFunction<ForgotPasswordPayload, Map<string, any>> = (payload) => {
    return servicesApiClient.post("/auth/forgot-password", { data: payload });
};

export const resetPassword: ServiceFunction<ResetPasswordPayload, Map<string, any>> = (payload) => {
    return servicesApiClient.put("/auth/reset-password", { data: payload });
};

export const changePassword: ServiceFunction<ChangePasswordPayload, Map<string, any>> = (payload) => {
    return servicesApiClient.put("/auth/change-password", { data: payload });
};

export const deleteAccount: ServiceFunction<DeleteAccountPayload, Map<string, any>> = (payload) => {
    return servicesApiClient.put("/auth/delete-account", { data: payload });
};

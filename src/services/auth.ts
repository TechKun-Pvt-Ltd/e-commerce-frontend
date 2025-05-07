import servicesApiClient from "@/lib/services-api-client";
import type { ServiceFunction } from "@/types/api";
import {
    RegistrationPayload, LoginPayload, TokenPayload,
    ForgotPasswordPayload, ResetPasswordPayload,
    ChangePasswordPayload, DeleteAccountPayload
} from "@/types/domains/auth";
import type { ShopUser } from "@/types/domains/user";

export const register: ServiceFunction<RegistrationPayload, ShopUser> = (payload) => {
    return servicesApiClient.post("/auth/register", { data: payload });
};

export const login: ServiceFunction<LoginPayload, TokenPayload> = (payload) => {
    return servicesApiClient.post("/auth/login", { data: payload });
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

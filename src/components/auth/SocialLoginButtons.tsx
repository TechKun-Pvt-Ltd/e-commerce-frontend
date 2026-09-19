"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";

interface SocialLoginButtonsProps {
    mode?: "login" | "register";
    returnUrl?: string;
    showDivider?: boolean;
    dividerText?: string;
}

export default function SocialLoginButtons({
    mode = "login",
    returnUrl = "/",
    showDivider = true,
    dividerText,
}: SocialLoginButtonsProps) {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleSocialLogin = (provider: "google" | "facebook" | "instagram") => {
        try {
            setLoadingProvider(provider);
            const targetUrl = `/api/auth/oauth/${provider}?mode=${mode}&returnUrl=${encodeURIComponent(returnUrl)}`;
            window.location.href = targetUrl;
        } catch (error) {
            setLoadingProvider(null);
            console.error("Social login navigation error:", error);
            toast.error("Failed to start social login. Please try again.");
        }
    };

    const actionText = mode === "register" ? "Sign up with" : "Continue with";
    const defaultDivider = mode === "register" ? "Or sign up with email" : "Or continue with email";

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col gap-2.5">
                {/* Google Button */}
                <Button
                    type="button"
                    variant="outline"
                    disabled={loadingProvider !== null}
                    onClick={() => handleSocialLogin("google")}
                    className="w-full flex items-center justify-center gap-3 py-5 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 rounded-lg transition-all shadow-2xs"
                >
                    {loadingProvider === "google" ? (
                        <Spinner className="h-4 w-4" />
                    ) : (
                        <FcGoogle className="h-5 w-5 shrink-0" />
                    )}
                    <span>{actionText} Google</span>
                </Button>

                {/* Facebook Button */}
                <Button
                    type="button"
                    variant="outline"
                    disabled={loadingProvider !== null}
                    onClick={() => handleSocialLogin("facebook")}
                    className="w-full flex items-center justify-center gap-3 py-5 text-sm font-medium border-gray-300 hover:bg-blue-50/50 hover:border-blue-300 text-gray-700 rounded-lg transition-all shadow-2xs"
                >
                    {loadingProvider === "facebook" ? (
                        <Spinner className="h-4 w-4 text-[#1877F2]" />
                    ) : (
                        <FaFacebook className="h-5 w-5 text-[#1877F2] shrink-0" />
                    )}
                    <span>{actionText} Facebook</span>
                </Button>

                {/* Instagram Button */}
                <Button
                    type="button"
                    variant="outline"
                    disabled={loadingProvider !== null}
                    onClick={() => handleSocialLogin("instagram")}
                    className="w-full flex items-center justify-center gap-3 py-5 text-sm font-medium border-gray-300 hover:bg-pink-50/50 hover:border-pink-300 text-gray-700 rounded-lg transition-all shadow-2xs"
                >
                    {loadingProvider === "instagram" ? (
                        <Spinner className="h-4 w-4 text-[#E4405F]" />
                    ) : (
                        <FaInstagram className="h-5 w-5 text-[#E4405F] shrink-0" />
                    )}
                    <span>{actionText} Instagram</span>
                </Button>
            </div>

            {showDivider && (
                <div className="relative flex items-center justify-center my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <span className="relative bg-white px-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {dividerText || defaultDivider}
                    </span>
                </div>
            )}
        </div>
    );
}

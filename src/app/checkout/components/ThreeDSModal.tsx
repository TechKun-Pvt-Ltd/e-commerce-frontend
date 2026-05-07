"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ThreeDSModalProps {
    htmlContent: string;
    onClose: () => void;
}

/**
 * Renders iyzico's 3DS HTML inside a sandboxed iframe.
 * The iframe contains a form that auto-submits to the bank's OTP page.
 * After OTP, iyzico redirects back to our /iyzico/callback endpoint,
 * which responds with JS that breaks out of the iframe via window.top.location.href.
 */
export default function ThreeDSModal({ htmlContent, onClose }: ThreeDSModalProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Write the HTML into the iframe document so the embedded form auto-submits
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(htmlContent);
        doc.close();
    }, [htmlContent]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Secure Payment Verification</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Complete the 3D Secure verification from your bank</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                        title="Cancel payment"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 3DS iframe */}
                <iframe
                    ref={iframeRef}
                    title="3D Secure Payment"
                    className="w-full border-0"
                    style={{ height: "480px" }}
                    // allow-same-origin is required so our callback JS can set window.top.location
                    sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation"
                />

                <div className="px-6 py-3 bg-gray-50 border-t flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-gray-500">
                        Your card details are encrypted and processed securely by iyzico
                    </p>
                </div>
            </div>
        </div>
    );
}

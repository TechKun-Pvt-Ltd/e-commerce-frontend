'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    ShieldCheck, 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    Layers, 
    Truck, 
    Activity, 
    CheckCircle2, 
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { login, logout } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/domains/user';
import { TokenPayload } from '@/types/domains/auth';

const adminLoginSchema = z.object({
    email: z.string().email('Please enter a valid work email address'),
    password: z.string().min(1, 'Password is required')
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { loading, authenticated, user } = useAppSelector(state => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const returnUrl = useMemo(
        () => searchParams.get('redirect') || searchParams.get('returnUrl') || '/admin',
        [searchParams]
    );

    const errorParam = searchParams.get('error');

    useEffect(() => {
        if (errorParam === 'unauthorized') {
            toast.error('Access denied. Administrator privileges are required to access this area.', { 
                id: 'admin-unauth',
                duration: 5000 
            });
        }
    }, [errorParam]);

    const isAuthorizedAdmin = authenticated && (user?.roleName === UserRole.ADMIN || user?.roleName === UserRole.PLATFORM_ADMIN);

    useEffect(() => {
        if (!loading && isAuthorizedAdmin) {
            router.replace(returnUrl);
        }
    }, [loading, isAuthorizedAdmin, returnUrl, router]);

    const form = useForm<AdminLoginFormValues>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (values: AdminLoginFormValues) => {
        setSubmitting(true);
        try {
            const result = await dispatch(login(values));
            if (result.meta.requestStatus === 'fulfilled') {
                const payload = result.payload as TokenPayload;
                const loggedInUser = payload.user;

                // Strict security enforcement: Reject non-admin roles immediately
                if (loggedInUser.roleName !== UserRole.ADMIN && loggedInUser.roleName !== UserRole.PLATFORM_ADMIN) {
                    await dispatch(logout());
                    form.setError('root', {
                        type: 'manual',
                        message: 'Access Denied: This portal is strictly restricted to authorized administrators.'
                    });
                    toast.error('Unauthorized access attempt: This account does not possess administrator privileges.');
                    setSubmitting(false);
                    return;
                }

                localStorage.setItem("expiresAt", String(payload.expiresAt));
                toast.success(`Welcome back, ${loggedInUser.fullName || 'Administrator'}`);
                router.replace(returnUrl);
            } else {
                const errorMsg = (result.payload as string) || 'Authentication failed. Please verify your credentials.';
                form.setError('root', {
                    type: 'manual',
                    message: errorMsg
                });
                toast.error(errorMsg);
            }
        } catch {
            form.setError('root', {
                type: 'manual',
                message: 'An unexpected authentication error occurred. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#0B0F17] text-slate-100 selection:bg-amber-500 selection:text-black">
            {/* Left Column: Trendyol Partner / Operations Showcase (Hidden on mobile, 50% on lg, 55% on xl) */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#0B0F17] to-[#030712] border-r border-slate-800/80">
                {/* Background decorative glow & grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header / Brand */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-tight">
                            K
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                KAVENGO
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    Console
                                </span>
                            </span>
                            <p className="text-xs text-slate-400 font-medium">Merchant & Operations Suite</p>
                        </div>
                    </div>
                </div>

                {/* Center Content: Platform Highlights */}
                <div className="relative z-10 max-w-xl space-y-8 my-auto py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Production Operations Environment v2.4</span>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Unified Management & Command Center
                        </h1>
                        <p className="text-slate-400 text-sm xl:text-base leading-relaxed">
                            Control catalog pipelines, real-time inventory adjustments, multi-tier pricing matrices, and order fulfillment across all channels with zero latency.
                        </p>
                    </div>

                    {/* Operational Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-sm">
                            <div className="size-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                                <Layers className="size-5" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-200 mb-1">Catalog & Variants</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Bulk category reassignment, automated SKU generation, and instant attribute synchronization.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-sm">
                            <div className="size-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                                <Truck className="size-5" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-200 mb-1">Fulfillment Engine</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Integrated carrier APIs, instant cargo labels, and real-time shipment status reconciliation.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-sm">
                            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                                <Activity className="size-5" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-200 mb-1">Telemetry & Analytics</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Live order velocity, revenue attribution, margin reporting, and anomaly alerts.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-sm">
                            <div className="size-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-200 mb-1">RBAC Security</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Strict role-based perimeter, encrypted audit trails, and automatic session revocation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer on Left Side */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>All Operational Systems Nominal</span>
                    </div>
                    <span>TLS 1.3 / AES-256 GCM Encrypted</span>
                </div>
            </div>

            {/* Right Column: Dedicated Admin Sign-In Form */}
            <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-between p-6 sm:p-12 xl:p-16">
                {/* Mobile Header (visible only below lg) */}
                <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-base">
                            K
                        </div>
                        <span className="font-bold text-white tracking-tight">KAVENGO ADMIN</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Secure Portal
                    </span>
                </div>

                <div className="w-full max-w-md mx-auto my-auto py-8">
                    {/* Security Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium mb-6">
                        <ShieldCheck className="size-3.5" />
                        <span>Authorized Personnel Only</span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2 mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Administrator Sign In
                        </h2>
                        <p className="text-sm text-slate-400">
                            Enter your verified credentials to access the Kavengo operations dashboard.
                        </p>
                    </div>

                    {/* Unauthorized Warning Banner if errorParam is set */}
                    {errorParam === 'unauthorized' && (
                        <div className="mb-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
                            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-semibold block text-amber-300 mb-0.5">Administrative Privileges Required</strong>
                                Your current account does not have authorization to access the admin console. Please sign in with an administrator account.
                            </div>
                        </div>
                    )}

                    {/* Form Component */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {form.formState.errors.root && (
                                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-3 text-rose-200 text-xs leading-relaxed">
                                    <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                    <span>{form.formState.errors.root.message}</span>
                                </div>
                            )}

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                                            Work Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
                                                <Input
                                                    type="email"
                                                    autoComplete="username"
                                                    placeholder="admin@kavengo.com"
                                                    className="h-11 pl-10 bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-xl transition-all"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-rose-400" />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                                                Password
                                            </FormLabel>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••••••"
                                                    className="h-11 pl-10 pr-10 bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-xl transition-all"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                                                    tabIndex={-1}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-rose-400" />
                                    </FormItem>
                                )}
                            />

                            {/* Trust Indicator Note */}
                            <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                                <span>Single sign-on protected by hardware security key & token verification</span>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Spinner className="size-4 text-slate-950" />
                                        <span>Authenticating Console Session...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Console</span>
                                        <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Notice / Security Disclaimer (Strictly NO sign-up links) */}
                    <div className="mt-8 pt-6 border-t border-slate-800/80 text-center space-y-2">
                        <p className="text-xs text-slate-400">
                            Having trouble accessing your administrator credentials?
                        </p>
                        <p className="text-xs text-slate-500">
                            Contact Internal Security Operations at{' '}
                            <span className="text-slate-300 font-mono select-all">ops-security@kavengo.com</span>
                        </p>
                    </div>
                </div>

                {/* Copyright & Compliance Footer */}
                <div className="text-center text-xs text-slate-500 pt-6">
                    <p>
                        © {new Date().getFullYear()} Kavengo E-Commerce Platform. All rights reserved.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Unauthorized access attempts are monitored, logged, and will be prosecuted under applicable cyber regulations.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0F17] text-white gap-3">
                <Spinner className="size-8 text-amber-500" />
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Initializing Admin Security Gateway...</p>
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}

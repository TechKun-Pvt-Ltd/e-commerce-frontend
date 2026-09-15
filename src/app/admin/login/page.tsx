'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(1, 'Şifre alanı zorunludur')
});

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { loading, authenticated, user } = useAppSelector(state => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const returnUrl = useMemo(
        () => searchParams.get('redirect') || searchParams.get('returnUrl') || '/admin/products',
        [searchParams]
    );

    const errorParam = searchParams.get('error');

    useEffect(() => {
        if (errorParam === 'unauthorized') {
            toast.error('Bu alana erişim için yönetici yetkisi gereklidir.', { id: 'admin-unauth' });
        }
    }, [errorParam]);

    const isAuthorizedAdmin = authenticated && (user?.roleName === UserRole.ADMIN || user?.roleName === UserRole.PLATFORM_ADMIN);

    useEffect(() => {
        if (!loading && isAuthorizedAdmin) {
            router.replace(returnUrl);
        }
    }, [loading, isAuthorizedAdmin, returnUrl, router]);

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof adminLoginSchema>) => {
        setSubmitting(true);
        try {
            const result = await dispatch(login(values));
            if (result.meta.requestStatus === 'fulfilled') {
                const payload = result.payload as TokenPayload;
                const loggedInUser = payload.user;

                // Strict role verification: Reject if not ADMIN or PLATFORM_ADMIN
                if (loggedInUser.roleName !== UserRole.ADMIN && loggedInUser.roleName !== UserRole.PLATFORM_ADMIN) {
                    await dispatch(logout());
                    form.setError('root', {
                        type: 'manual',
                        message: 'Erişim engellendi: Bu portal sadece yetkili yöneticiler içindir.'
                    });
                    toast.error('Yetkisiz giriş: Bu hesap yönetici yetkisine sahip değil.');
                    setSubmitting(false);
                    return;
                }

                localStorage.setItem("expiresAt", String(payload.expiresAt));
                toast.success('Yönetici girişi başarılı.');
                router.replace(returnUrl);
            } else {
                form.setError('root', {
                    type: 'manual',
                    message: (result.payload as string) || 'Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.'
                });
            }
        } catch {
            form.setError('root', {
                type: 'manual',
                message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                {/* Brand / Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl mb-1 text-white">
                        <ShieldCheck className="size-7 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Kavengo Admin Portal
                    </h1>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        Güvenli Yönetim Girişi
                    </p>
                </div>

                {/* Card */}
                <Card className="border-slate-700/50 bg-slate-900/90 backdrop-blur-xl text-slate-100 shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-white">Giriş Yap</CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                            Yönetici paneline erişmek için kimlik bilgilerinizi giriniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {form.formState.errors.root && (
                                    <div className="p-3 text-xs bg-red-950/60 border border-red-800/80 rounded-md text-red-200">
                                        {form.formState.errors.root.message}
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs text-slate-300 font-medium">E-posta</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 size-4 text-slate-500" />
                                                    <Input
                                                        type="email"
                                                        placeholder="admin@kavengo.com"
                                                        className="pl-9 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs text-slate-300 font-medium">Şifre</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 size-4 text-slate-500" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="pl-9 pr-10 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                                                    >
                                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors mt-2"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner className="size-4" />
                                            Giriş Yapılıyor...
                                        </span>
                                    ) : (
                                        'Yönetici Girişi Yap'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-500">
                    Kavengo E-Ticaret Yönetim Platformu © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
                <Spinner className="size-8" />
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}

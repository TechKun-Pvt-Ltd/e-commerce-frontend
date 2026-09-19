'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
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
    email: z.string().email('Gecerli bir e-posta adresi girin'),
    password: z.string().min(1, 'Sifre gereklidir')
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
            toast.error('Yetkisiz erisim. Bu alana erisim icin yonetici yetkisi gereklidir.', {
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
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (values: AdminLoginFormValues) => {
        setSubmitting(true);
        try {
            const result = await dispatch(login(values));
            if (result.meta.requestStatus === 'fulfilled') {
                const payload = result.payload as TokenPayload;
                const loggedInUser = payload.user;

                if (loggedInUser.roleName !== UserRole.ADMIN && loggedInUser.roleName !== UserRole.PLATFORM_ADMIN) {
                    await dispatch(logout());
                    form.setError('root', {
                        type: 'manual',
                        message: 'Erisim reddedildi: Bu portal sadece yetkili yoneticilere aciktir.'
                    });
                    toast.error('Bu hesap yonetici yetkisine sahip degil.');
                    setSubmitting(false);
                    return;
                }

                localStorage.setItem('expiresAt', String(payload.expiresAt));
                toast.success(`Hos geldiniz, ${loggedInUser.fullName || 'Yonetici'}`);
                router.replace(returnUrl);
            } else {
                const errorMsg = (result.payload as string) || 'Kimlik dogrulama basarisiz. Bilgilerinizi kontrol edin.';
                form.setError('root', { type: 'manual', message: errorMsg });
                toast.error(errorMsg);
            }
        } catch {
            form.setError('root', {
                type: 'manual',
                message: 'Beklenmeyen bir hata olustu. Tekrar deneyin.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-900 mb-4">
                        <span className="text-2xl font-bold text-white tracking-tight">K</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Kavengo Yonetim</h1>
                    <p className="text-sm text-gray-500 mt-1">Yonetici girisi</p>
                </div>

                {errorParam === 'unauthorized' && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm">
                        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-semibold block text-amber-700 mb-1">Yonetici Yetkisi Gerekli</strong>
                            Bu hesap yonetici paneline erisim yetkisine sahip degil.
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {form.formState.errors.root && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
                                    <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{form.formState.errors.root.message}</span>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium text-gray-700">E-posta</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-3 size-4 text-gray-400 pointer-events-none" />
                                                <Input
                                                    type="email"
                                                    autoComplete="username"
                                                    placeholder="admin@kavengo.com"
                                                    className="h-11 pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-gray-900 rounded-xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-sm text-rose-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium text-gray-700">Sifre</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-3 size-4 text-gray-400 pointer-events-none" />
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    className="h-11 pl-10 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-gray-900 rounded-xl"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                    tabIndex={-1}
                                                    aria-label={showPassword ? 'Sifreyi gizle' : 'Sifreyi goster'}
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-sm text-rose-500" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Spinner className="size-4 text-white" />
                                        <span>Giris yapiliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Giris Yap</span>
                                        <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">Kavengo E-Ticaret Platformu</p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 gap-3">
                <Spinner className="size-8 text-gray-900" />
                <p className="text-sm text-gray-500">Yukleniyor...</p>
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
